import type { UserProfile } from '../../../core/auth/interface/auth.interface';

export const authStorage = {
  setTokens: (accessToken: string, refreshToken?: string) => {
    localStorage.setItem('token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
  },
  
  getAccessToken: () => {
    return localStorage.getItem('token');
  },

  getRefreshToken: () => {
    return localStorage.getItem('refresh_token');
  },

  setUser: (user: UserProfile) => {
    try {
      localStorage.setItem('user', JSON.stringify(user));
    } catch {
      // ignore
    }
  },

  getUser: (): UserProfile | null => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  
  removeTokens: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
};

