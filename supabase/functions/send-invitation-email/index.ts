// Sends the Hebrew invitation email for a pending bat_ayin.organization_invitations row.
// Authorization model: this function never uses a service-role key. It forwards the
// caller's own JWT to a Supabase client built with the anon key, so every RPC call below
// runs AS the calling user — the bat_ayin.is_org_manager() check inside get_invitation_for_email
// and mark_invitation_email_result is the only authorization gate, matching the rest of
// the org-admin RPCs in supabase/org-admin.sql. RESEND_API_KEY never leaves this function.
import { createClient } from "npm:@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://bat-ayin-tasks.vercel.app",
  "https://yeshivat-batayn.netlify.app",
  "http://127.0.0.1:8899"
];

function corsHeaders(origin: string | null): Record<string, string> {
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin"
  };
}

function json(body: unknown, status: number, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json" }
  });
}

function invitationEmailMarkup(appUrl: string, email: string, role: string) {
  const roleLabel = role === "manager" ? "מנהל" : "משתמש";
  const subject = "הוזמנתם למערכת המשימות של ישיבת בת עין";
  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; font-size: 16px; color:#111;">
      <p>שלום,</p>
      <p>הוזמנתם להצטרף למערכת ניהול המשימות והרכש של ישיבת בת עין, בתפקיד <strong>${roleLabel}</strong>.</p>
      <p>כדי להצטרף, היכנסו לכתובת הבאה והתחברו עם חשבון Google של הכתובת <strong>${email}</strong>:</p>
      <p><a href="${appUrl}" target="_blank" rel="noopener noreferrer">${appUrl}</a></p>
      <p>הכניסה תושלם אוטומטית מיד לאחר ההתחברות עם אותה כתובת מייל — אין צורך בקישור אישור נוסף.</p>
      <p>אם לא ציפיתם להזמנה זו, אפשר להתעלם מהודעה זו.</p>
    </div>`;
  const text =
    `שלום,\n\n` +
    `הוזמנתם להצטרף למערכת ניהול המשימות והרכש של ישיבת בת עין, בתפקיד ${roleLabel}.\n` +
    `כדי להצטרף, היכנסו לכתובת ${appUrl} והתחברו עם חשבון Google של הכתובת ${email}.\n` +
    `הכניסה תושלם אוטומטית מיד לאחר ההתחברות עם אותה כתובת מייל.\n\n` +
    `אם לא ציפיתם להזמנה זו, אפשר להתעלם מהודעה זו.`;
  return { subject, html, text };
}

Deno.serve(async (req) => {
  const headers = corsHeaders(req.headers.get("origin"));

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }
  if (req.method !== "POST") {
    return json({ ok: false, code: "method_not_allowed", reason: "Only POST is supported." }, 405, headers);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return json({ ok: false, code: "unauthorized", reason: "Missing Authorization header." }, 401, headers);
  }

  let invitationId: unknown;
  try {
    const body = await req.json();
    invitationId = body?.invitationId;
  } catch {
    return json({ ok: false, code: "invalid_body", reason: "Request body must be JSON." }, 400, headers);
  }
  if (!invitationId || typeof invitationId !== "string") {
    return json({ ok: false, code: "invalid_invitation_id", reason: "invitationId is required." }, 400, headers);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const resendFromEmail = Deno.env.get("RESEND_FROM_EMAIL");
  const appUrl = Deno.env.get("APP_URL");

  if (!supabaseUrl || !supabaseAnonKey) {
    return json({ ok: false, code: "server_misconfigured", reason: "Supabase environment is not configured." }, 500, headers);
  }
  if (!resendApiKey || !resendFromEmail || !appUrl) {
    return json({ ok: false, code: "server_misconfigured", reason: "Resend environment is not configured." }, 500, headers);
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });

    const { data: invitationRows, error: invitationError } = await supabase
      .schema("bat_ayin")
      .rpc("get_invitation_for_email", { p_invitation_id: invitationId });

    if (invitationError) {
      const message = invitationError.message || String(invitationError);
      if (message.includes("permission denied")) {
        return json(
          { ok: false, code: "forbidden", reason: "אין הרשאה לשלוח מייל להזמנה זו." },
          403,
          headers
        );
      }
      console.error("get_invitation_for_email rpc failed", invitationError);
      return json({ ok: false, code: "rpc_failed", reason: "אירעה שגיאה בבדיקת ההזמנה." }, 400, headers);
    }

    const invitation = Array.isArray(invitationRows) ? invitationRows[0] : invitationRows;
    if (!invitation) {
      return json({ ok: false, code: "not_found", reason: "Invitation not found." }, 404, headers);
    }
    if (invitation.status !== "pending") {
      return json({ ok: false, code: "not_pending", reason: "ההזמנה כבר אינה ממתינה." }, 409, headers);
    }

    const { subject, html, text } = invitationEmailMarkup(appUrl, invitation.email, invitation.role);

    let resendOk = false;
    let resendErrorMessage = "";
    try {
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: resendFromEmail,
          to: [invitation.email],
          subject,
          html,
          text
        })
      });
      if (resendResponse.ok) {
        resendOk = true;
      } else {
        const errorBody = await resendResponse.text();
        resendErrorMessage = `Resend ${resendResponse.status}: ${errorBody.slice(0, 500)}`;
      }
    } catch (error) {
      resendErrorMessage = error instanceof Error ? error.message : String(error);
    }

    const { error: markError } = await supabase
      .schema("bat_ayin")
      .rpc("mark_invitation_email_result", {
        p_invitation_id: invitationId,
        p_status: resendOk ? "sent" : "failed",
        p_error: resendOk ? null : resendErrorMessage.slice(0, 1000)
      });
    if (markError) {
      console.warn("mark_invitation_email_result failed", markError);
    }

    if (!resendOk) {
      console.error("Resend send failed", resendErrorMessage);
      return json(
        { ok: false, code: "email_send_failed", reason: "שליחת המייל נכשלה. ניתן לנסות שוב." },
        502,
        headers
      );
    }

    return json({ ok: true }, 200, headers);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("send-invitation-email unexpected error", message);
    return json({ ok: false, code: "unexpected_error", reason: "אירעה שגיאה בלתי צפויה. נסו שוב." }, 500, headers);
  }
});
