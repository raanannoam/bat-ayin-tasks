/** אייקונים SVG */
const ICONS = {
  home: '<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z"/>',
  today: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/><circle cx="12" cy="15" r="2"/>',
  tasks: '<path d="M8 6h12M8 12h12M8 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
  suppliers: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="3"/>',
  manager: '<path d="M12 15.5a3.5 3.5 0 0 0 0-7"/><path d="M19.4 15a1.8 1.8 0 0 0 .36 2l.04.04a2 2 0 1 1-2.83 2.83l-.04-.04a1.8 1.8 0 0 0-2-.36"/>',
  done: '<path d="M20 6 9 17l-5-5"/>',
  add: '<path d="M12 5v14M5 12h14"/>',
  back: '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  trash: '<path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l1 14h10l1-14"/>',
  users: '<circle cx="12" cy="9" r="3"/><path d="M5 20a7 7 0 0 1 14 0"/>',
  login: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/>',
  moon: '<path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z"/>',
  inbox: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h6l2 3h2l2-3h6"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v5l3 2"/>',
  money: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="3"/>',
  kitchen: '<path d="M7 3v18"/><path d="M4 3v6a3 3 0 0 0 6 0V3"/><path d="M15 3v18"/>',
  maintenance: '<path d="M14.7 6.3a4 4 0 0 0-5 5L4 17v3h3l5.7-5.7a4 4 0 0 0 5-5z"/>',
  study: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z"/>',
  events: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 3v4M16 3v4"/>',
  office: '<path d="M3 7h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  alert: '<circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>'
};

function icon(name) {
  return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.tasks}</svg>`;
}

function categoryIcon(id) {
  const map = { kitchen: "kitchen", maintenance: "maintenance", study: "study", money: "money", events: "events", office: "office" };
  return icon(map[id] || "office");
}

function esc(text) {
  return String(text ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatDateHe(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("he-IL", { day: "numeric", month: "short" });
  } catch { return iso; }
}
