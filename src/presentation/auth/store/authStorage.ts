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
  
  removeTokens: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
  }
};
