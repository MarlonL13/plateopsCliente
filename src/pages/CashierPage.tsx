import { Box, Card, CardContent, Typography } from "@mui/material";

export const CashierPage = () => {
  return (
    <Box display="grid" gap={2}>
      <Typography variant="h4">Caixa</Typography>
      <Card>
        <CardContent>
          <Typography variant="h6">Fechamento de contas</Typography>
          <Typography variant="body2" color="text.secondary">
            Base para visualizar mesas, total da conta e pagamentos.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
