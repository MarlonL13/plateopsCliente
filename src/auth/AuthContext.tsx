import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  clearStoredAuth,
  readStoredAuth,
  writeStoredAuth,
  type AuthState,
  type UserRole,
} from "./authStorage";

type AuthContextValue = AuthState & {
  login: (token: string, role: UserRole, userId: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>(() => readStoredAuth());

  const login = useCallback((token: string, role: UserRole, userId: string) => {
    const next = { token, role, userId };
    setState(next);
    writeStoredAuth(next);
  }, []);

  const logout = useCallback(() => {
    setState({ token: null, role: null, userId: null });
    clearStoredAuth();
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
