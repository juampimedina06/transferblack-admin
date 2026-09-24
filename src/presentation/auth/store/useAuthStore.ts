import { create } from 'zustand';
import type { UserProfile, AuthResponse } from '../../../core/auth/interface/auth.interface';
import { authStorage } from './authStorage';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  setSession: (authData: AuthResponse) => void;
  setUser: (userData: UserProfile) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!authStorage.getAccessToken(),
  
  setSession: (authData: AuthResponse) => {
    const { user, access_token, refresh_token } = authData.data;

    authStorage.setTokens(access_token, refresh_token);
    
    set({
      user,
      isAuthenticated: true,
    });
  },

  setUser: (userData: UserProfile) => {
    set({ user: userData });
  },

  logout: () => {
    authStorage.removeTokens();
    set({
      user: null,
      isAuthenticated: false,
    });
  }
}));
