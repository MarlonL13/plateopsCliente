import { Box, Card, CardContent, Typography } from "@mui/material";

export const KitchenPage = () => {
  return (
    <Box display="grid" gap={2}>
      <Typography variant="h4">Cozinha</Typography>
      <Card>
        <CardContent>
          <Typography variant="h6">Pedidos em andamento</Typography>
          <Typography variant="body2" color="text.secondary">
            Base para visualizar pedidos e atualizar status.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
