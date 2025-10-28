import { jwtDecode } from 'jwt-decode';
import { removeToken } from './localStorageService';

export const logOut = () => {
  removeToken();
  window.location.href = '/'; // reload trang để reset state
};

export const checkTokenExpiration = (token) => {
  if (!token) return false; 
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
};