/** The pagination shape every list screen in this app reads. */
export type UiPagination = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  startIndex: number;
  endIndex: number;
};

export function uiPagination(
  p: { currentPage: number; totalPages: number; totalItems: number; itemsPerPage: number },
): UiPagination {
  const startIndex = p.totalItems === 0 ? 0 : (p.currentPage - 1) * p.itemsPerPage + 1;
  const endIndex = Math.min(p.currentPage * p.itemsPerPage, p.totalItems);
  return { ...p, startIndex, endIndex };
}
