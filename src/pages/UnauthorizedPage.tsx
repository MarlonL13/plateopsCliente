import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export const UnauthorizedPage = () => {
  const navigate = useNavigate();
  return (
    <Box display="grid" gap={2} justifyItems="center" mt={12}>
      <Typography variant="h4">Acesso negado</Typography>
      <Typography variant="body2" color="text.secondary">
        Você não tem permissão para acessar esta área.
      </Typography>
      <Button variant="contained" onClick={() => navigate("/login")}>
        Voltar ao login
      </Button>
    </Box>
  );
};
