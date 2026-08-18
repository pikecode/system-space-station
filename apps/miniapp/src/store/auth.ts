import { create } from 'zustand';
import type { CustomerLoginResponseDto, UserRole } from 'shared';
import { storage } from '../utils/storage';

interface UserInfo {
  accountType?: 'EMPLOYEE';
  id: string;
  name: string;
  employeeNo?: string | null;
  role: UserRole;
  departmentId?: string | null;
  deptType?: string | null;
  department?: {
    id: string;
    name: string;
    type: string;
    parent?: {
      id: string;
      name: string;
      type: string;
    } | null;
  } | null;
  canWriteCustomer?: boolean;
  avatar?: string | null;
  shareCode?: string | null;
}

type CustomerInfo = CustomerLoginResponseDto['customer'] & {
  accountType: 'CUSTOMER';
  role?: UserRole;
  departmentId?: null;
  deptType?: null;
  canWriteCustomer?: false;
  shareCode?: null;
};

interface AuthState {
  token: string | null;
  user: UserInfo | CustomerInfo | null;
  setAuth: (token: string, user: UserInfo) => void;
  setCustomerAuth: (token: string, customer: CustomerLoginResponseDto['customer']) => void;
  logout: () => void;
  isLoggedIn: () => boolean;
  isCustomer: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: storage.getToken(),
  user: storage.getUser<UserInfo | CustomerInfo>(),
  setAuth: (token, user) => {
    const employeeUser = { ...user, accountType: 'EMPLOYEE' as const };
    storage.setToken(token);
    storage.setUser(employeeUser);
    set({ token, user: employeeUser });
  },
  setCustomerAuth: (token, customer) => {
    const customerUser = { ...customer, accountType: 'CUSTOMER' as const };
    storage.setToken(token);
    storage.setUser(customerUser);
    set({ token, user: customerUser });
  },
  logout: () => {
    storage.clear();
    set({ token: null, user: null });
  },
  isLoggedIn: () => !!get().token,
  isCustomer: () => get().user?.accountType === 'CUSTOMER',
}));
