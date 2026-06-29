import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppOrgMember } from "../../types/appOrgMember.js";
import { sortOrgMembers } from "../../../domain/organization/orgMemberFilters.js";
import { loadSupabaseOrgMembersWriteContext } from "./loadSupabaseOrgMembersWriteContext.js";
import { mapDbOrgMemberRowsToApp } from "./mapDbOrgMemberRowToApp.js";

/** קורא חברי ארגון דרך RPC מאובטח */
export function createSupabaseOrgMembersReadAdapter(client: SupabaseClient | null) {
  return {
    async loadOrgMembers(): Promise<AppOrgMember[]> {
      if (!client) throw new Error("Supabase is not configured.");
      const contextResult = await loadSupabaseOrgMembersWriteContext(client);
      if (!contextResult.ok) {
        throw new Error(contextResult.reason || contextResult.code || "Org members context failed.");
      }

      const batAyin = client.schema("bat_ayin");
      const { data, error } = await batAyin.rpc("list_organization_members", {
        p_organization_id: contextResult.ctx.organizationId
      });

      if (error) throw error;
      return sortOrgMembers(mapDbOrgMemberRowsToApp(data || []));
    }
  };
}
