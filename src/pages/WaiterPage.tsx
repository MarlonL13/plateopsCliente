import { Box, Card, CardContent, Typography } from "@mui/material";

export const WaiterPage = () => {
  return (
    <Box display="grid" gap={2}>
      <Typography variant="h4">Garçom</Typography>
      <Card>
        <CardContent>
          <Typography variant="h6">Mesas e pedidos</Typography>
          <Typography variant="body2" color="text.secondary">
            Base para abertura de mesas, registro de pedidos e observações.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
