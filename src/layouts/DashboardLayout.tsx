import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { UseAuth } from "../auth/AuthContext";

const translateRole = (role?: string) => {
  switch (role) {
    case "WAITER":
      return "Garçom";
    case "KITCHEN":
      return "Cozinha";
    case "CASHIER":
      return "Caixa";
    default:
      return "";
  }
};

export const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, logout } = UseAuth();

  const roleHome =
    role === "WAITER"
      ? "/dashboard/waiter"
      : role === "KITCHEN"
        ? "/dashboard/kitchen"
        : "/dashboard/cashier";

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            PlateOps — {translateRole(role ?? "")}
          </Typography>
          <Button
            color="inherit"
            onClick={() => navigate(roleHome)}
            sx={{
              textDecoration: isActive("/dashboard") && !isActive("/dashboard/insights") ? "underline" : "none",
              textUnderlineOffset: "4px",
            }}
          >
            Painel
          </Button>
          <Button
            color="inherit"
            onClick={() => navigate("/dashboard/insights")}
            sx={{
              textDecoration: isActive("/dashboard/insights") ? "underline" : "none",
              textUnderlineOffset: "4px",
            }}
          >
            Insights
          </Button>
          <Button
            color="inherit"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Sair
          </Button>
        </Toolbar>
      </AppBar>
      <Box component="main" flex={1} p={3} bgcolor="#f6f7fb">
        <Outlet />
      </Box>
    </Box>
  );
};
