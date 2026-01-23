import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";
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
  const { role, logout } = UseAuth();

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            PlateOps — {translateRole(role ?? "")}
          </Typography>
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
