export interface PaginatedResponse<T> {
  total: number;
  page: number;
  pageSize: number;
  data: T[];
}

export interface PaginationQuery {
  page?: number | string;
  pageSize?: number | string;
}

export type MaybePaginated<T> = T[] | PaginatedResponse<T>;
