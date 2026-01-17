import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type UserRole = "WAITER" | "KITCHEN" | "CASHIER";

type AuthState = {
  token: string | null;
  role: UserRole | null;
};

type AuthContextValue = AuthState & {
  login: (token: string, role: UserRole) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const storageKey = "plateops.auth";

const readStoredAuth = (): AuthState => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return { token: null, role: null };
    return JSON.parse(raw) as AuthState;
  } catch {
    return { token: null, role: null };
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>(() => readStoredAuth());

  const login = useCallback((token: string, role: UserRole) => {
    const next = { token, role };
    setState(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  }, []);

  const logout = useCallback(() => {
    setState({ token: null, role: null });
    localStorage.removeItem(storageKey);
  }, []);

  const value = useMemo(
    () => ({ ...state, login, logout }),
    [state, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const UseAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
