import { useQuery } from '@tanstack/react-query';
import { departmentsApi } from '../services/departments';

export function useDepartmentTree() {
  return useQuery({
    queryKey: ['departments', 'tree'],
    queryFn: () => departmentsApi.getTree(),
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsApi.getAll(),
  });
}
