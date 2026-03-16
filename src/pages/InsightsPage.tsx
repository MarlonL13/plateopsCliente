import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControlLabel,
  Switch,
  Stack,
  Typography,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../api/client";

type InsightsRange = "today" | "7d" | "30d";

type InsightsResponse = {
  range: InsightsRange;
  fromDate: string;
  generatedAt: string;
  kpis: {
    ordersCreated: number;
    activeOrders: number;
    readyOrders: number;
    paidOrders: number;
    revenue: number;
    avgPrepMinutes: number;
  };
  statusBreakdown: Array<{
    status: string;
    label: string;
    count: number;
  }>;
  hourlyLoad: Array<{
    hour: number;
    label: string;
    orders: number;
  }>;
  peakHour: {
    hour: number;
    label: string;
    orders: number;
  };
  topItems: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  waiterLeaderboard: Array<{
    waiterId: string;
    waiterName: string;
    orders: number;
    items: number;
    revenue: number;
  }>;
  categoryMix: Array<{
    category: string;
    quantity: number;
    revenue: number;
  }>;
  tableSnapshot: Array<{
    tableNumber: number;
    activeOrders: number;
    itemCount: number;
    totalValue: number;
    statuses: string[];
  }>;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const rangeLabel: Record<InsightsRange, string> = {
  today: "Hoje",
  "7d": "7 dias",
  "30d": "30 dias",
};

const toCsv = (rows: string[][]) => {
  return rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");
};

const downloadInsightsCsv = (data: InsightsResponse) => {
  const rows: string[][] = [
    ["range", data.range],
    ["generatedAt", data.generatedAt],
    ["ordersCreated", String(data.kpis.ordersCreated)],
    ["activeOrders", String(data.kpis.activeOrders)],
    ["readyOrders", String(data.kpis.readyOrders)],
    ["paidOrders", String(data.kpis.paidOrders)],
    ["revenue", String(data.kpis.revenue)],
    ["avgPrepMinutes", String(data.kpis.avgPrepMinutes)],
    [],
    ["Top Items"],
    ["name", "quantity", "revenue"],
    ...data.topItems.map((item) => [item.name, String(item.quantity), String(item.revenue)]),
    [],
    ["Waiter Leaderboard"],
    ["name", "orders", "items", "revenue"],
    ...data.waiterLeaderboard.map((waiter) => [
      waiter.waiterName,
      String(waiter.orders),
      String(waiter.items),
      String(waiter.revenue),
    ]),
  ];

  const csv = toCsv(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `plateops-insights-${data.range}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const InsightCard = ({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) => {
  return (
    <Card sx={{ borderRadius: 2.5 }}>
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Typography sx={{ color: "#64748B", mb: 0.5, fontSize: 12 }}>
          {title}
        </Typography>
        <Typography sx={{ fontWeight: 800, mb: 0.25, fontSize: 24, lineHeight: 1.1 }}>
          {value}
        </Typography>
        <Typography sx={{ color: "#94A3B8", fontSize: 11 }}>
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
};

const InsightsPage = () => {
  const [range, setRange] = useState<InsightsRange>("today");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const insightsQuery = useQuery({
    queryKey: ["orders-insights", range],
    queryFn: () =>
      apiFetch<InsightsResponse>(`/api/orders/insights?range=${range}`),
    refetchInterval: autoRefresh ? 30000 : false,
  });

  const data = insightsQuery.data;

  const maxHourlyOrders = useMemo(() => {
    if (!data?.hourlyLoad?.length) return 1;
    return Math.max(...data.hourlyLoad.map((slot) => slot.orders), 1);
  }, [data]);

  const busiestTables = useMemo(() => {
    if (!data?.tableSnapshot) return [];
    return [...data.tableSnapshot]
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 8);
  }, [data]);

  const categoryMax = useMemo(() => {
    if (!data?.categoryMix.length) return 1;
    return Math.max(...data.categoryMix.map((category) => category.quantity), 1);
  }, [data]);

  const generatedLabel = data
    ? new Date(data.generatedAt).toLocaleString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        day: "2-digit",
        month: "2-digit",
      })
    : "-";

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={1.5}
        mb={2}
      >
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: 24 }}>
            Insights Operacionais
          </Typography>
          <Typography sx={{ color: "#64748B", fontSize: 13 }}>
            Tendências, performance e mesas mais ativas em tempo real.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <FormControlLabel
            sx={{ mr: 0 }}
            control={
              <Switch
                size="small"
                checked={autoRefresh}
                onChange={(event) => setAutoRefresh(event.target.checked)}
              />
            }
            label={<Typography sx={{ fontSize: 12 }}>Auto 30s</Typography>}
          />
          {(["today", "7d", "30d"] as InsightsRange[]).map((option) => (
            <Button
              key={option}
              variant={range === option ? "contained" : "outlined"}
              onClick={() => setRange(option)}
              size="small"
            >
              {rangeLabel[option]}
            </Button>
          ))}
          <Button
            size="small"
            variant="outlined"
            startIcon={<RefreshIcon fontSize="small" />}
            onClick={() => insightsQuery.refetch()}
          >
            Atualizar
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadIcon fontSize="small" />}
            onClick={() => data && downloadInsightsCsv(data)}
            disabled={!data}
          >
            CSV
          </Button>
        </Stack>
      </Box>

      <Alert
        severity="info"
        sx={{
          mb: 1.5,
          py: 0.2,
          alignItems: "center",
          "& .MuiAlert-message": { py: 0.25 },
          fontSize: 12,
        }}
      >
        Atualizado em {generatedLabel} • Pico: {data?.peakHour.label ?? "--:--"} ({data?.peakHour.orders ?? 0} pedidos)
      </Alert>

      {insightsQuery.isLoading && (
        <Typography sx={{ color: "#64748B" }}>Carregando insights...</Typography>
      )}

      {insightsQuery.isError && (
        <Typography sx={{ color: "#B91C1C" }}>
          Não foi possível carregar os insights.
        </Typography>
      )}

      {data && (
        <Stack spacing={1.5}>
          <Box
            display="grid"
            gridTemplateColumns={{
              xs: "repeat(2, minmax(0, 1fr))",
              md: "repeat(3, minmax(0, 1fr))",
              lg: "repeat(6, minmax(0, 1fr))",
            }}
            gap={1}
          >
            <InsightCard
              title="Pedidos Criados"
              value={`${data.kpis.ordersCreated}`}
              subtitle={`Período: ${rangeLabel[data.range]}`}
            />
            <InsightCard
              title="Pedidos Ativos"
              value={`${data.kpis.activeOrders}`}
              subtitle="Pedidos não pagos no sistema"
            />
            <InsightCard
              title="Receita"
              value={formatCurrency(data.kpis.revenue)}
              subtitle="Somente pedidos pagos no período"
            />
            <InsightCard
              title="Tempo Médio de Preparo"
              value={`${data.kpis.avgPrepMinutes} min`}
              subtitle="Média até atualização de status"
            />
            <InsightCard
              title="Pedidos Prontos"
              value={`${data.kpis.readyOrders}`}
              subtitle="Pedidos em status READY"
            />
            <InsightCard
              title="Pedidos Pagos"
              value={`${data.kpis.paidOrders}`}
              subtitle="Pedidos finalizados"
            />
          </Box>

          <Box
            display="grid"
            gridTemplateColumns={{ xs: "1fr", lg: "1.5fr 1fr" }}
            gap={1}
          >
            <Card sx={{ borderRadius: 2.5 }}>
              <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Typography sx={{ fontWeight: 700, mb: 1.2, fontSize: 15 }}>
                  Carga por Hora
                </Typography>
                <Stack spacing={0.8}>
                  {data.hourlyLoad.map((slot) => (
                    <Box key={slot.label} display="flex" alignItems="center" gap={1.5}>
                      <Typography sx={{ width: 48, color: "#64748B", fontSize: 12 }}>
                        {slot.label}
                      </Typography>
                      <Box
                        sx={{
                          flex: 1,
                          height: 6,
                          borderRadius: 999,
                          background: "#E2E8F0",
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            width: `${(slot.orders / maxHourlyOrders) * 100}%`,
                            height: "100%",
                            borderRadius: 999,
                            background: "linear-gradient(90deg, #2563EB, #0EA5E9)",
                          }}
                        />
                      </Box>
                      <Typography sx={{ width: 28, textAlign: "right", fontSize: 12 }}>
                        {slot.orders}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 2.5 }}>
              <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Typography sx={{ fontWeight: 700, mb: 1.2, fontSize: 15 }}>
                  Status dos Pedidos
                </Typography>
                <Stack spacing={1}>
                  {data.statusBreakdown.map((status) => (
                    <Box
                      key={status.status}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography sx={{ fontSize: 13 }}>{status.label}</Typography>
                      <Chip label={status.count} size="small" />
                    </Box>
                  ))}
                </Stack>

                <Divider sx={{ my: 1.2 }} />

                <Typography sx={{ fontWeight: 700, mb: 1, fontSize: 15 }}>
                  Top Itens
                </Typography>
                <Stack spacing={1}>
                  {data.topItems.length === 0 && (
                    <Typography sx={{ color: "#64748B" }}>
                      Sem dados para este período.
                    </Typography>
                  )}
                  {data.topItems.map((item) => (
                    <Box key={item.name}>
                      <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{item.name}</Typography>
                      <Typography variant="caption" sx={{ color: "#64748B" }}>
                        {item.quantity} vendidos • {formatCurrency(item.revenue)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Box>

          <Box
            display="grid"
            gridTemplateColumns={{ xs: "1fr", lg: "1fr 1fr" }}
            gap={1}
          >
            <Card sx={{ borderRadius: 2.5 }}>
              <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Typography sx={{ fontWeight: 700, mb: 1.2, fontSize: 15 }}>
                  Ranking de Garçons
                </Typography>
                <Stack spacing={0.9}>
                  {data.waiterLeaderboard.length === 0 && (
                    <Typography sx={{ fontSize: 12, color: "#64748B" }}>
                      Sem dados para o período.
                    </Typography>
                  )}
                  {data.waiterLeaderboard.map((waiter, index) => (
                    <Box
                      key={waiter.waiterId}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        border: "1px solid #E2E8F0",
                        borderRadius: 1.5,
                        px: 1,
                        py: 0.8,
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                          #{index + 1} {waiter.waiterName}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: "#64748B" }}>
                          {waiter.orders} pedidos • {waiter.items} itens
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
                        {formatCurrency(waiter.revenue)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 2.5 }}>
              <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Typography sx={{ fontWeight: 700, mb: 1.2, fontSize: 15 }}>
                  Mix por Categoria
                </Typography>
                <Stack spacing={0.9}>
                  {data.categoryMix.map((category) => (
                    <Box key={category.category}>
                      <Box display="flex" justifyContent="space-between" mb={0.4}>
                        <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
                          {category.category}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: "#64748B" }}>
                          {category.quantity} • {formatCurrency(category.revenue)}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          height: 5,
                          borderRadius: 999,
                          background: "#E2E8F0",
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            width: `${(category.quantity / categoryMax) * 100}%`,
                            height: "100%",
                            background: "linear-gradient(90deg, #4F46E5, #06B6D4)",
                          }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Box>

          <Card sx={{ borderRadius: 2.5 }}>
            <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
              <Typography sx={{ fontWeight: 700, mb: 1.2, fontSize: 15 }}>
                Mesas Mais Movimentadas
              </Typography>
              <Box
                display="grid"
                gridTemplateColumns={{
                  xs: "repeat(2, minmax(0, 1fr))",
                  md: "repeat(4, minmax(0, 1fr))",
                }}
                gap={1}
              >
                {busiestTables.map((table) => (
                  <Box
                    key={table.tableNumber}
                    sx={{
                      border: "1px solid #E2E8F0",
                      borderRadius: 1.5,
                      p: 1,
                      background: "#F8FAFC",
                    }}
                  >
                    <Typography sx={{ fontWeight: 800, fontSize: 16 }}>
                      Mesa {table.tableNumber}
                    </Typography>
                    <Typography sx={{ color: "#64748B", mt: 0.3, fontSize: 11 }}>
                      {table.activeOrders} pedidos ativos • {table.itemCount} itens
                    </Typography>
                    <Typography sx={{ fontWeight: 700, mt: 0.8, fontSize: 13 }}>
                      {formatCurrency(table.totalValue)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Stack>
      )}
    </Box>
  );
};

export default InsightsPage;
