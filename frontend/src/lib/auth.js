import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'omg_token';

export const setAuthToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getAuthToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const isAuthenticated = () => {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 > Date.now();
  } catch (e) {
    return false;
  }
};

export const getUserFromToken = () => {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return {
      username: decoded.sub,
      exp: decoded.exp
    };
  } catch (e) {
    return null;
  }
};
