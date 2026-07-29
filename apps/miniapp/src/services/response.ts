import type { MaybePaginated, PaginatedResponse } from 'shared';

export function normalizePaginated<T>(value: MaybePaginated<T>): PaginatedResponse<T> {
  if (Array.isArray(value)) {
    return {
      total: value.length,
      page: 1,
      pageSize: value.length,
      data: value,
    };
  }

  return value;
}
