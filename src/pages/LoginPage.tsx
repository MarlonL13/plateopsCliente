import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { UseAuth } from "../auth/AuthContext";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = UseAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // Placeholder flow. Replace with API call.
    const role = username.toLowerCase().includes("kitchen")
      ? "KITCHEN"
      : username.toLowerCase().includes("cash")
        ? "CASHIER"
        : "WAITER";

    login("dev-token", role);
    navigate(`/dashboard/${role.toLowerCase()}`);
  };

  return (
    <Box
      display="flex"
      minHeight="100vh"
      alignItems="center"
      justifyContent="center"
    >
      <Card sx={{ width: 380 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            PlateOps Login
          </Typography>
          <Box component="form" onSubmit={handleSubmit} display="grid" gap={2}>
            <TextField
              label="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              fullWidth
            />
            <Button type="submit" variant="contained">
              Sign In
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
