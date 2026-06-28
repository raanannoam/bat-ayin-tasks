/** מקבץ קישורי הזמנה לפי supplier_order_id */
export function groupLinksByOrderId(
  rows: { supplier_order_id: string; url: string | null }[] | null | undefined
) {
  const grouped = new Map<string, string[]>();
  (rows || []).forEach((row) => {
    if (!row.url) return;
    const list = grouped.get(row.supplier_order_id) || [];
    list.push(row.url);
    grouped.set(row.supplier_order_id, list);
  });
  return grouped;
}
