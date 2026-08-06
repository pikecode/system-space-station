import request from './request';
import type { PaginatedResponse, QueryUsersDto, UserOptionDto } from 'shared';

export const usersApi = {
  getAll: <T = UserOptionDto>(params?: QueryUsersDto) =>
    request.get<PaginatedResponse<T>, PaginatedResponse<T>>('/users', { params }),
  getOne: (id: string) => request.get(`/users/${id}`),
  getDepartmentMembers: <T = UserOptionDto>(departmentId?: string) =>
    request.get<T[], T[]>('/users/department-members', { params: { departmentId } }),
  getCustomerOwners: (keyword?: string) =>
    request.get<UserOptionDto[], UserOptionDto[]>('/users/customer-owners', { params: { keyword } }),
  getAssignableMembers: <T = UserOptionDto>(keyword?: string) =>
    request.get<T[], T[]>('/users/assignable-members', { params: { keyword } }),
  getOrganizationMembers: <T = UserOptionDto>() =>
    request.get<T[], T[]>('/users/organization-members'),
  create: (data: unknown) => request.post('/users', data),
  update: (id: string, data: unknown) => request.patch(`/users/${id}`, data),
  transfer: (id: string, data: unknown) => request.patch(`/users/${id}/transfer`, data),
  removeFromDepartment: (id: string) => request.patch(`/users/${id}/remove-department`),
  setStatus: (id: string, data: unknown) => request.patch(`/users/${id}/status`, data),
};
