import { Navigate } from "react-router-dom";
import { UseAuth } from "../auth/AuthContext";

type UserRole = "WAITER" | "KITCHEN" | "CASHIER";

type Props = {
  allowed: UserRole[];
  children: React.ReactNode;
};

export const RequireRole = ({ allowed, children }: Props) => {
  const { token, role } = UseAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!role || !allowed.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
