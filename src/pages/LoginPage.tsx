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
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import ContainerSvg from "../assets/Container.svg";

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
      sx={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 4,
        flexDirection: "column",
       background: "linear-gradient(135deg, #E3F2FD 1%, #E8D5F2 25%, #EDD1E8 50%, #F3E5F5 75%, #E8ECFF 100%)",
      
      }}
    >
      <img src={ContainerSvg} alt="PlateOps Logo" style={{ width: 120, height: 120,  }} />
    <Typography sx={{ fontSize: 36, fontWeight: "bold", pb: 0, pt: 0, marginTop: -3 }} gutterBottom>
            PlateOps
          </Typography>
    
    <Typography sx={{ fontSize: 14, pb: 1 }} gutterBottom>
            Faça login na sua conta.
          </Typography>
      <Card sx={{ width: {xs: "100%", md:480}, borderRadius: 4, p: 3 }}>
        <CardContent sx={{ }} className="pb-10">
          
          <Typography sx={{ fontSize: 14 }} gutterBottom>
            Nome de usuário
          </Typography>
          <Box component="form" sx={{borderRadius: 4}} onSubmit={handleSubmit} display="grid" >
            <TextField 
            sx={{ borderRadius: 4 }}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              fullWidth
            /><Typography sx={{ fontSize: 14, pt: 2 }}  >
            Senha
          </Typography>
            <TextField
              sx={{borderRadius: 4}}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              fullWidth
            />
            <Button 
              sx={{
                
                p: 1.3,
                marginTop: 3, 
                borderRadius: 4,
                background: "linear-gradient(135deg, #2196F3 0%, #9C27B0 100%)",
                color: "white",
                fontWeight: "bold",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "scale(1.02)",
                  background: "linear-gradient(135deg, #1976D2 0%, #7B1FA2 100%)",
                }
              }} 
              type="submit" 
              variant="contained"
            >
              <LockOpenOutlinedIcon sx={{ mr: 1 }} />
              Entrar
            </Button>

          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
