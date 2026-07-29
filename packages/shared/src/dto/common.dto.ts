export interface PaginatedResponse<T> {
  total: number;
  page: number;
  pageSize: number;
  data: T[];
}

export type MaybePaginated<T> = T[] | PaginatedResponse<T>;
