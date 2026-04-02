"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  goldpayApi,
  setAuthToken,
  clearAuthToken,
  AUTH_TOKEN_KEY,
  type Merchant,
} from "@/lib/goldpay-api";

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (apiKey: string) => Promise<void>;
  rotateApiKey: (name?: string) => Promise<string>;
  refreshUser: () => Promise<void>;
  logout: () => void;
  token: string | null;
  user: Merchant | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const AUTH_USER_KEY = "goldpay_merchant_user";

function readToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function readUser(): Merchant | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Merchant;
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
}

function writeUser(user: Merchant | null) {
  if (typeof window === "undefined") return;

  if (!user) {
    localStorage.removeItem(AUTH_USER_KEY);
    return;
  }

  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

function clearStoredSession() {
  clearAuthToken();
  writeUser(null);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<Merchant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const clearSession = useCallback((redirectToSignIn = false) => {
    clearStoredSession();
    setTokenState(null);
    setUser(null);

    if (redirectToSignIn) {
      router.replace("/auth/sign-in");
    }
  }, [router]);

  useEffect(() => {
    const storedToken = readToken();
    const storedUser = readUser();
    let isActive = true;
    const hadSessionCookie =
      typeof document !== "undefined" &&
      document.cookie.split("; ").some((entry) => entry.startsWith(`${AUTH_TOKEN_KEY}=`));

    setTokenState(storedToken);
    setUser(storedUser);

    if (!storedToken) {
      if (storedUser) {
        writeUser(null);
      }
      setIsLoading(false);
      return;
    }

    // Keep the credential available to server-rendered dashboard loaders.
    setAuthToken(storedToken);

    goldpayApi.merchants
      .me()
      .then((currentUser) => {
        if (!isActive) return;
        setUser(currentUser);
        writeUser(currentUser);
        if (!hadSessionCookie) {
          router.refresh();
        }
      })
      .catch(() => {
        if (!isActive) return;
        clearSession();
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [clearSession, router]);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearSession(true);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key && event.key !== AUTH_TOKEN_KEY && event.key !== AUTH_USER_KEY) {
        return;
      }

      setTokenState(readToken());
      setUser(readUser());
    };

    window.addEventListener("goldpay-unauthorized", handleUnauthorized);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("goldpay-unauthorized", handleUnauthorized);
      window.removeEventListener("storage", handleStorage);
    };
  }, [clearSession]);

  const login = useCallback(
    async (apiKey: string) => {
      const credential = apiKey.trim();
      if (!credential) {
        throw new Error("API key is required");
      }

      setAuthToken(credential);

      try {
        const currentUser = await goldpayApi.merchants.me();
        setTokenState(credential);
        setUser(currentUser);
        writeUser(currentUser);
        router.replace("/");
      } catch (error) {
        clearSession();
        throw error;
      }
    },
    [clearSession, router]
  );

  const logout = useCallback(() => {
    clearSession(true);
  }, [clearSession]);

  const rotateApiKey = useCallback(
    async (name?: string) => {
      const nextCredential = (await goldpayApi.merchants.rotateMyApiKey(name)).api_key;
      setAuthToken(nextCredential);

      const currentUser = await goldpayApi.merchants.me();
      setTokenState(nextCredential);
      setUser(currentUser);
      writeUser(currentUser);
      router.refresh();

      return nextCredential;
    },
    [router]
  );

  const refreshUser = useCallback(async () => {
    const currentUser = await goldpayApi.merchants.me();
    setUser(currentUser);
    writeUser(currentUser);
    router.refresh();
  }, [router]);

  const value: AuthContextValue = {
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    rotateApiKey,
    refreshUser,
    logout,
    token,
    user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
