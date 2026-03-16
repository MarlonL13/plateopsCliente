import {
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../api/client";
import { useSocket } from "../socket";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
}

type OrderStatus = "PENDING" | "IN_PROGRESS" | "READY";

interface OrderApi {
  id: string;
  table: { number: number };
  items: OrderItem[];
  createdAt: string;
  notes?: string | null;
}

type OrdersByStatus = Record<OrderStatus, OrderApi[]>;

const getCardStyles = (status: OrderStatus) => {
  switch (status) {
    case "PENDING":
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

const getElapsedTime = (currentTime: Date, createdAt: string): string => {
  const created = new Date(createdAt);
  const diff = Math.floor((currentTime.getTime() - created.getTime()) / 1000);

  if (diff < 60) {
    return `${diff}s`;
  }
  if (diff < 3600) {
    return `${Math.floor(diff / 60)}m`;
  }
  return `${Math.floor(diff / 3600)}h`;
};

const getElapsedMinutes = (currentTime: Date, createdAt: string) => {
  const created = new Date(createdAt);
  return Math.floor((currentTime.getTime() - created.getTime()) / 60000);
};

const isOrderOverdue = (
  status: OrderStatus,
  currentTime: Date,
  createdAt: string,
) => {
  const minutes = getElapsedMinutes(currentTime, createdAt);
  if (status === "PENDING") {
    return minutes >= 12;
  }
  if (status === "IN_PROGRESS") {
    return minutes >= 20;
  }
  return false;
};

const OrderCard = ({
  order,
  status,
  currentTime,
  onUpdateStatus,
  isUpdating,
}: {
  order: OrderApi;
  status: OrderStatus;
  currentTime: Date;
  onUpdateStatus: (orderId: string) => void;
  isUpdating: boolean;
}) => {
  const cardStyles = getCardStyles(status);
  const isOverdue = isOrderOverdue(status, currentTime, order.createdAt);
  const itemsRef = useRef<HTMLDivElement | null>(null);
  const scrollTopRef = useRef(0);

  useLayoutEffect(() => {
    if (itemsRef.current) {
      itemsRef.current.scrollTop = scrollTopRef.current;
    }
  });

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: `2px solid ${cardStyles.borderColor}`,
        backgroundColor: cardStyles.backgroundColor,
        minWidth: 300,
        maxWidth: 350,
        fontWeight: "bold",
        boxShadow: isOverdue ? "0 0 0 2px #DC2626 inset" : "none",
      }}
    >
      <CardContent sx={{ pb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Typography
            variant="h5"
            sx={{
              px: 2,
              py: 1,
              backgroundColor: "#ffffffff",
              fontWeight: "bold",
              borderRadius: 2,
              fontSize: 28,
            }}
          >
            Mesa {order.table.number}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#666",
              fontWeight: "bold",
              fontSize: 18,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <AccessTimeIcon /> {getElapsedTime(currentTime, order.createdAt)}
          </Typography>
        </Box>

        {isOverdue && (
          <Chip
            label="Atrasado"
            size="small"
            sx={{ mb: 1.2, background: "#FEE2E2", color: "#991B1B", fontWeight: 700 }}
          />
        )}

        <Box
          ref={itemsRef}
          onScroll={(event) => {
            scrollTopRef.current = event.currentTarget.scrollTop;
          }}
          sx={{
            maxHeight: 300,
            overflowY: "auto",
            pr: 0.5,
          }}
        >
          {order.items.map((item) => (
            <Box key={item.id} mb={1}>
              <Box
                sx={{ backgroundColor: "white", p: 1, pr: 2, borderRadius: 2 }}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
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
        </Box>

        {order.notes && (
          <Box
            sx={{
              backgroundColor: "#fff4c2",
              border: "1px dashed #d4a017",
              padding: "10px 12px",
              borderRadius: 2,
              display: "block",
              marginTop: 1.5,
              marginBottom: 1.5,
              color: "#5c3b00",
              fontWeight: "bold",
            }}
          >
            Observação: {order.notes}
          </Box>
        )}

        {status === "PENDING" && (
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
            onClick={() => onUpdateStatus(order.id)}
            disabled={isUpdating}
          >
            Iniciar Preparo
          </Button>
        )}

        {status === "IN_PROGRESS" && (
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
            onClick={() => onUpdateStatus(order.id)}
            disabled={isUpdating}
          >
            Marcar como Pronto
          </Button>
        )}

        {status === "READY" && (
          <Box
            sx={{
              backgroundColor: "#4CAF50",
              color: "white",
              fontWeight: "bold",
              borderRadius: 2,
              mt: 2,
              p: 1.3,
              textAlign: "center",
            }}
          >
            Pronto para Servir
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export const KitchenPage = () => {
  const queryClient = useQueryClient();
  const { refreshCount } = useSocket();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tableSearch, setTableSearch] = useState("");
  const [showOnlyOverdue, setShowOnlyOverdue] = useState(false);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const lastOverdueCountRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const ordersQuery = useQuery({
    queryKey: ["kitchen-orders"],
    queryFn: () => apiFetch<OrdersByStatus>("/api/orders/all"),
  });

  useEffect(() => {
    if (refreshCount > 0) {
      queryClient.invalidateQueries({ queryKey: ["kitchen-orders"] });
    }
  }, [refreshCount, queryClient]);

  const updateStatus = useMutation({
    mutationFn: (orderId: string) =>
      apiFetch("/api/orders/update-status", {
        method: "POST",
        body: JSON.stringify({ orderId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen-orders"] });
    },
  });

  const bulkUpdateStatus = useMutation({
    mutationFn: (orderIds: string[]) =>
      Promise.all(
        orderIds.map((orderId) =>
          apiFetch("/api/orders/update-status", {
            method: "POST",
            body: JSON.stringify({ orderId }),
          }),
        ),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen-orders"] });
    },
  });

  const pendingOrders = useMemo(
    () => ordersQuery.data?.PENDING ?? [],
    [ordersQuery.data],
  );
  const inProgressOrders = useMemo(
    () => ordersQuery.data?.IN_PROGRESS ?? [],
    [ordersQuery.data],
  );
  const readyOrders = useMemo(
    () => ordersQuery.data?.READY ?? [],
    [ordersQuery.data],
  );

  const filterAndSortOrders = useMemo(() => {
    const tableFilter = tableSearch.trim();

    const process = (orders: OrderApi[], status: OrderStatus) => {
      return orders
        .filter((order) => {
          const tableMatch = String(order.table.number).includes(tableFilter);
          const overdueMatch =
            !showOnlyOverdue || isOrderOverdue(status, currentTime, order.createdAt);
          return tableMatch && overdueMatch;
        })
        .sort(
          (a, b) =>
            getElapsedMinutes(currentTime, b.createdAt) -
            getElapsedMinutes(currentTime, a.createdAt),
        );
    };

    return {
      pending: process(pendingOrders, "PENDING"),
      inProgress: process(inProgressOrders, "IN_PROGRESS"),
      ready: process(readyOrders, "READY"),
    };
  }, [
    tableSearch,
    showOnlyOverdue,
    currentTime,
    pendingOrders,
    inProgressOrders,
    readyOrders,
  ]);

  const overdueCount = useMemo(() => {
    return pendingOrders.filter((order) => isOrderOverdue("PENDING", currentTime, order.createdAt))
      .length +
      inProgressOrders.filter((order) =>
        isOrderOverdue("IN_PROGRESS", currentTime, order.createdAt),
      ).length;
  }, [pendingOrders, inProgressOrders, currentTime]);

  useEffect(() => {
    if (soundAlerts && overdueCount > lastOverdueCountRef.current) {
      try {
        const audioContext = new window.AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = "triangle";
        oscillator.frequency.value = 880;
        gainNode.gain.value = 0.08;

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.14);
      } catch {
        console.warn("Audio alert unavailable in this browser context");
      }
    }

    lastOverdueCountRef.current = overdueCount;
  }, [overdueCount, soundAlerts]);

  // ⭐ MUDANÇA: Função para obter cores baseado no status

  return (
    <Box sx={{ p: 3, backgroundColor: "#F5F5F5", minHeight: "100vh" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Visor da Cozinha
        </Typography>
        <Box
          sx={{
            backgroundColor: "#ffffff",
            borderRadius: 2,
            px: 2,
            py: 1,
            boxShadow: "0 2px 8px 0 rgba(0,0,0,0.08)",
          }}
        >
          <Typography variant="body2" sx={{ color: "#666", fontWeight: 600 }}>
            Hora atual
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            {currentTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </Typography>
        </Box>
      </Box>

      <Box
        display="flex"
        flexWrap="wrap"
        gap={1.5}
        alignItems="center"
        mb={2}
      >
        <Chip label={`Total: ${pendingOrders.length + inProgressOrders.length + readyOrders.length}`} />
        <Chip label={`Atrasados: ${overdueCount}`} color={overdueCount > 0 ? "error" : "default"} />
        <TextField
          size="small"
          value={tableSearch}
          onChange={(event) => setTableSearch(event.target.value)}
          placeholder="Filtrar mesa"
          sx={{ minWidth: 180, backgroundColor: "#fff", borderRadius: 1 }}
        />
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={showOnlyOverdue}
              onChange={(event) => setShowOnlyOverdue(event.target.checked)}
            />
          }
          label="Somente atrasados"
        />
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={soundAlerts}
              onChange={(event) => setSoundAlerts(event.target.checked)}
            />
          }
          label="Som alerta"
        />
      </Box>

      {ordersQuery.isLoading && (
        <Typography sx={{ color: "#6B7280", mb: 2 }}>
          Carregando pedidos...
        </Typography>
      )}

      {ordersQuery.isError && (
        <Typography sx={{ color: "#B91C1C", mb: 2 }}>
          Erro ao carregar pedidos.
        </Typography>
      )}

      {/* NEW ORDERS */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography
          variant="h6"
          sx={{
            color: "#FF6B6B",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          NOVOS PEDIDOS ({filterAndSortOrders.pending.length})
        </Typography>
        <Button
          size="small"
          variant="outlined"
          disabled={
            filterAndSortOrders.pending.length === 0 ||
            updateStatus.isPending ||
            bulkUpdateStatus.isPending
          }
          onClick={() =>
            bulkUpdateStatus.mutate(filterAndSortOrders.pending.map((order) => order.id))
          }
        >
          Iniciar todos
        </Button>
      </Box>
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
        {filterAndSortOrders.pending.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            status="PENDING"
            currentTime={currentTime}
            onUpdateStatus={(orderId) => updateStatus.mutate(orderId)}
            isUpdating={updateStatus.isPending}
          />
        ))}
      </Box>

      {/* IN PROGRESS ORDERS */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography
          variant="h6"
          sx={{
            color: "#FFB81C",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          EM PREPARO ({filterAndSortOrders.inProgress.length})
        </Typography>
        <Button
          size="small"
          variant="outlined"
          disabled={
            filterAndSortOrders.inProgress.length === 0 ||
            updateStatus.isPending ||
            bulkUpdateStatus.isPending
          }
          onClick={() =>
            bulkUpdateStatus.mutate(filterAndSortOrders.inProgress.map((order) => order.id))
          }
        >
          Marcar todos prontos
        </Button>
      </Box>
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
        {filterAndSortOrders.inProgress.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            status="IN_PROGRESS"
            currentTime={currentTime}
            onUpdateStatus={(orderId) => updateStatus.mutate(orderId)}
            isUpdating={updateStatus.isPending}
          />
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
        PRONTO ({filterAndSortOrders.ready.length})
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
        {filterAndSortOrders.ready.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            status="READY"
            currentTime={currentTime}
            onUpdateStatus={(orderId) => updateStatus.mutate(orderId)}
            isUpdating={updateStatus.isPending}
          />
        ))}
      </Box>
    </Box>
  );
};