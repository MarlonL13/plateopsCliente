import { Box, Card, CardContent, Typography, Button, Chip, Badge, colors } from "@mui/material";
import { useState, useEffect } from "react";
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
}

interface Order {
  id: number;
  status: "NEW" | "IN_PROGRESS" | "READY";
  createdAt: Date;
  items: OrderItem[];
  priority: "normal" | "urgent";
  notes?: string;
}

export const KitchenPage = () => {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 1,
      status: "NEW",
      createdAt: new Date(Date.now() - 9 * 60000),
      priority: "urgent",
      notes: "Sem sal",
      items: [
        { id: "1", name: "Bife Ribeye", quantity: 1 },
        { id: "2", name: "Salada Caesar", quantity: 1 },
        { id: "3", name: "Vinho (Copo)", quantity: 2 },
      ],
    },
    {
      id: 10,
      status: "NEW",
      createdAt: new Date(Date.now() - 9 * 60000),
      priority: "urgent",
      items: [
        { id: "1", name: "Bolo de Chocolate Quente", quantity: 1 },
        { id: "2", name: "Cheesecake", quantity: 1 },
        { id: "3", name: "Café", quantity: 1 },
      ],
    },
    {
      id: 4,
      status: "NEW",
      createdAt: new Date(Date.now() - 4 * 60000),
      priority: "urgent",
      items: [
        { id: "1", name: "Tiramisu", quantity: 1 },
        { id: "2", name: "Café", quantity: 1 },
      ],
    },
    {
      id: 5,
      status: "NEW",
      createdAt: new Date(Date.now() - 4 * 60000),
      priority: "normal",
      notes: "Sem pimenta, alho extra",
      items: [
        { id: "1", name: "Refogado de Vegetais", quantity: 1 },
        { id: "2", name: "Bruschetta", quantity: 1 },
        { id: "3", name: "Vinho (Copo)", quantity: 1 },
      ],
    },
    {
      id: 2,
      status: "IN_PROGRESS",
      createdAt: new Date(Date.now() - 14 * 60000),
      priority: "normal",
      items: [
        { id: "1", name: "Salmão Grelhado", quantity: 1 },
        { id: "2", name: "Pasta à Carbonara", quantity: 1 },
        { id: "3", name: "Sopa do Dia", quantity: 2 },
      ],
    },
    {
      id: 7,
      status: "IN_PROGRESS",
      createdAt: new Date(Date.now() - 14 * 60000),
      priority: "normal",
      notes: "Bem passado",
      items: [
        { id: "1", name: "Bife Ribeye", quantity: 1 },
        { id: "2", name: "Salmão Grelhado", quantity: 1 },
      ],
    },
  ]);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getElapsedTime = (createdAt: Date): string => {
    const diff = Math.floor((currentTime.getTime() - createdAt.getTime()) / 1000);
    
    if (diff < 60) {
      return `${diff}s`;
    } else if (diff < 3600) {
      return `${Math.floor(diff / 60)}m`;
    } else {
      return `${Math.floor(diff / 3600)}h`;
    }
  };

  const handleStartPreparing = (orderId: number) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: "IN_PROGRESS" } : order
      )
    );
  };

  const handleMarkReady = (orderId: number) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: "READY" } : order
      )
    );
  };

  const newOrders = orders.filter((o) => o.status === "NEW");
  const inProgressOrders = orders.filter((o) => o.status === "IN_PROGRESS");
  const readyOrders = orders.filter((o) => o.status === "READY");

  // ⭐ MUDANÇA: Função para obter cores baseado no status
  const getCardStyles = (status: "NEW" | "IN_PROGRESS" | "READY") => {
    switch (status) {
      case "NEW":
        return {
          backgroundColor: "#ffe6e6ff",
          borderColor: "#ff1c1cff",
        };
      case "IN_PROGRESS":
        return {
          backgroundColor: "#FFF9E6",
          borderColor: "#FFB81C",
        };
      case "READY":
        return {
          backgroundColor: "#E6F7E6",
          borderColor: "#4CAF50",
        };
      default:
        return {
          backgroundColor: "#ffffff",
          borderColor: "#E0E0E0",
        };
    }
  };

  const OrderCard = ({ order }: { order: Order }) => {
    // ⭐ MUDANÇA: Obter estilos de cor baseado no status
    const cardStyles = getCardStyles(order.status);

    return (
      <Card
        sx={{
          borderRadius: 3,
          border: `2px solid ${cardStyles.borderColor}`,
          backgroundColor: cardStyles.backgroundColor,
          minWidth: 300,
          maxWidth: 350,
          fontWeight: "bold"
        }}
      >
        <CardContent sx={{ pb: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Typography variant="h5"  sx={{ px: 2, py: 1, backgroundColor: "#ffffffff", fontWeight: "bold", borderRadius: 2, fontSize: 28 }}>
              {order.id}
            </Typography>
            <Typography variant="body2" sx={{ color: "#666", fontWeight: "bold", fontSize: 18, display: "flex", alignItems: "center", gap: 0.5 }}>
              <AccessTimeIcon/> {getElapsedTime(order.createdAt)}
            </Typography>
          </Box>

          {order.items.map((item) => (
            <Box key={item.id} mb={1}>
              <Box sx={{backgroundColor: "white", p:1, pr: 2, borderRadius: 2}} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  {item.name}
                </Typography>
                <Badge
                  badgeContent={item.quantity}
                  sx={{
                    "& .MuiBadge-badge": {
                      backgroundColor: "#333",
                      color: "white",
                      fontWeight: "bold",
                    },
                  }}
                />
              </Box>
            </Box>
          ))}

          {order.notes && (
            <Typography
              variant="caption"
              sx={{
                backgroundColor: "#fff490ff",
                padding: "8px 12px",
                borderRadius: 1,
                display: "block",
                marginTop: 1.5,
                marginBottom: 1.5,
                color: "#333",
                fontWeight: "bold",
              }}
            >
               {order.notes}
            </Typography>
          )}

          {order.status === "NEW" && (
            <Button
              fullWidth
              variant="contained"
              sx={{
                backgroundColor: "#FFB81C",
                color: "white",
                fontWeight: "bold",
                borderRadius: 2,
                mt: 2,
                "&:hover": {
                  backgroundColor: "#F0A500",
                },
              }}
              onClick={() => handleStartPreparing(order.id)}
            >
               Iniciar Preparo
            </Button>
          )}

          {order.status === "IN_PROGRESS" && (
            <Button
              fullWidth
              variant="contained"
              sx={{
                backgroundColor: "#4CAF50",
                color: "white",
                fontWeight: "bold",
                borderRadius: 2,
                mt: 2,
                "&:hover": {
                  backgroundColor: "#45a049",
                },
              }}
              onClick={() => handleMarkReady(order.id)}
            >
               Marcar como Pronto
            </Button>
          )}

          {order.status === "READY" && (
            <Box
              sx={{
                backgroundColor: "#4CAF50",
                color: "white",
                fontWeight: "bold",
                borderRadius: 2,
                mt: 2,
                p: 1.3,
                textAlign: "center",
                animation: "pulse 2s infinite",
                "@keyframes pulse": {
                  "0%": {
                    opacity: 1,
                  },
                  "50%": {
                    opacity: 0.7,
                  },
                  "100%": {
                    opacity: 1,
                  },
                },
              }}
            >
               Pronto para Servir
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3, backgroundColor: "#F5F5F5", minHeight: "100vh" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Visor da Cozinha
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          {currentTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        </Typography>
      </Box>

      {/* NEW ORDERS */}
      <Typography
        variant="h6"
        sx={{
          color: "#FF6B6B",
          fontWeight: "bold",
          mb: 2,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
         NOVOS PEDIDOS ({newOrders.length})
      </Typography>
      <Box
        display="grid"
        gridTemplateColumns={{
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(4, 1fr)",
        }}
        gap={2}
        mb={4}
      >
        {newOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </Box>

      {/* IN PROGRESS ORDERS */}
      <Typography
        variant="h6"
        sx={{
          color: "#FFB81C",
          fontWeight: "bold",
          mb: 2,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
         EM PREPARO ({inProgressOrders.length})
      </Typography>
      <Box
        display="grid"
        gridTemplateColumns={{
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(4, 1fr)",
        }}
        gap={2}
        mb={4}
      >
        {inProgressOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </Box>

      {/* READY ORDERS */}
      <Typography
        variant="h6"
        sx={{
          color: "#4CAF50",
          fontWeight: "bold",
          mb: 2,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
         PRONTO ({readyOrders.length})
      </Typography>
      <Box
        display="grid"
        gridTemplateColumns={{
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(4, 1fr)",
        }}
        gap={2}
      >
        {readyOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </Box>
    </Box>
  );
};