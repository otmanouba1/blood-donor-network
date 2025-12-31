import { toast } from "react-hot-toast";
import { api } from "../config/api";

export const handleAuthError = (navigate) => {
  localStorage.removeItem("token");
  toast.error("Authentication error: Session expired. Please login again.");
  navigate("/login");
};

export const makeAuthenticatedRequest = async (url, options = {}, navigate) => {
  try {
    const response = await api({
      url,
      ...options,
    });
    return response;
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      handleAuthError(navigate);
    }
    throw error;
  }
};

export const isTokenValid = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Date.now() / 1000;
    
    return payload.exp > currentTime;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};
