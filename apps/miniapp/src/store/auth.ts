import { create } from 'zustand';
import { UserRole } from 'shared';
import { storage } from '../utils/storage';

interface UserInfo {
  id: string;
  name: string;
  role: UserRole;
  departmentId?: string | null;
  avatar?: string | null;
}

interface AuthState {
  token: string | null;
  user: UserInfo | null;
  setAuth: (token: string, user: UserInfo) => void;
  logout: () => void;
  isLoggedIn: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: storage.getToken(),
  user: storage.getUser<UserInfo>(),
  setAuth: (token, user) => {
    storage.setToken(token);
    storage.setUser(user);
    set({ token, user });
  },
  logout: () => {
    storage.clear();
    set({ token: null, user: null });
  },
  isLoggedIn: () => !!get().token,
}));
