"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { type User } from "firebase/auth";
import { googleLogin, logoutUser, subscribeToAuth } from "@/lib/firebase/googleLogin";
import { verifyAdminEmail } from "@/lib/actions/adminActions";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  adminRole: string | null;
  adminChecking: boolean;
  signIn: () => Promise<User | null>;
  signOut: () => Promise<void>;
  checkAdminStatus: (email?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  adminRole: null,
  adminChecking: false,
  signIn: async () => null,
  signOut: async () => {},
  checkAdminStatus: async () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [adminChecking, setAdminChecking] = useState(false);

  const checkAdmin = async (emailToCheck?: string) => {
    const email = emailToCheck || user?.email;
    if (!email) {
      setIsAdmin(false);
      setAdminRole(null);
      return false;
    }
    setAdminChecking(true);
    try {
      const res = await verifyAdminEmail(email);
      if (res.authorized) {
        setIsAdmin(true);
        setAdminRole(res.role || "admin");
        return true;
      } else {
        setIsAdmin(false);
        setAdminRole(null);
        return false;
      }
    } catch {
      setIsAdmin(false);
      setAdminRole(null);
      return false;
    } finally {
      setAdminChecking(false);
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser?.email) {
        await checkAdmin(currentUser.email);
      } else {
        setIsAdmin(false);
        setAdminRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      const res = await googleLogin();
      setUser(res.user);
      if (res.user.email) {
        await checkAdmin(res.user.email);
      }
      return res.user;
    } catch (err: any) {
      console.error("Sign-in error:", err);
      return null;
    }
  };

  const signOut = async () => {
    try {
      await logoutUser();
      setUser(null);
      setIsAdmin(false);
      setAdminRole(null);
    } catch (err) {
      console.error("Sign-out error:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        adminRole,
        adminChecking,
        signIn,
        signOut,
        checkAdminStatus: checkAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
