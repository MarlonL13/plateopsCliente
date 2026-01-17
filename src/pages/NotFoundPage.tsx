import { Box, Typography } from "@mui/material";

export const NotFoundPage = () => {
  return (
    <Box display="grid" gap={2} justifyItems="center" mt={12}>
      <Typography variant="h4">Página não encontrada</Typography>
      <Typography variant="body2" color="text.secondary">
        Verifique o endereço ou volte ao menu principal.
      </Typography>
    </Box>
  );
};
