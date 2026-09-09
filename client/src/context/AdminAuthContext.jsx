import React, { createContext, useContext, useState, useEffect } from "react";
import { adminService } from "../services/adminService";

const AdminAuthContext = createContext();

const TOKEN_KEY = "kheti_se_admin_token";
const ADMIN_KEY = "kheti_se_admin_user";

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem(ADMIN_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(TOKEN_KEY) || null;
    } catch (e) {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(true);

  // Validate existing token on mount
  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await adminService.getProfile();
        if (res?.admin) {
          setAdmin(res.admin);
          localStorage.setItem(ADMIN_KEY, JSON.stringify(res.admin));
        }
      } catch (err) {
        console.warn("Session expired or invalid:", err);
        logout();
      } finally {
        setIsLoading(false);
      }
    };
    verifySession();
  }, [token]);

  const login = async (email, password) => {
    const data = await adminService.login(email, password);
    if (data?.token && data?.admin) {
      setToken(data.token);
      setAdmin(data.admin);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(ADMIN_KEY, JSON.stringify(data.admin));
      return data;
    }
    throw new Error(data?.error || "Login failed");
  };

  const updateAdminProfile = (newAdmin, newToken) => {
    if (newAdmin) {
      setAdmin(newAdmin);
      localStorage.setItem(ADMIN_KEY, JSON.stringify(newAdmin));
    }
    if (newToken) {
      setToken(newToken);
      localStorage.setItem(TOKEN_KEY, newToken);
    }
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: Boolean(token && admin),
        isLoading,
        login,
        logout,
        updateAdminProfile
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
