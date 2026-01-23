export type UserRole = "WAITER" | "KITCHEN" | "CASHIER";

export type AuthState = {
  token: string | null;
  role: UserRole | null;
  userId: string | null;
};

export const authStorageKey = "plateops.auth";

export const readStoredAuth = (): AuthState => {
  try {
    const raw = localStorage.getItem(authStorageKey);
    if (!raw) return { token: null, role: null, userId: null };
    return JSON.parse(raw) as AuthState;
  } catch {
    return { token: null, role: null, userId: null };
  }
};

export const getStoredToken = () => readStoredAuth().token;

export const writeStoredAuth = (next: AuthState) => {
  localStorage.setItem(authStorageKey, JSON.stringify(next));
};

export const clearStoredAuth = () => {
  localStorage.removeItem(authStorageKey);
};
