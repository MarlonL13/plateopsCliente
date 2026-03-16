import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../api/client";
import { useSocket } from "../socket";

export type StatusMesa =
  | "Pedido Feito"
  | "Em Preparo"
  | "Comida Pronta"
  | "Vazia";

export type Mesa = {
  id: number;
  status: StatusMesa;
  itemCount: number;
  totalValue: number;
};

type ApiCashierStatus = "PENDING" | "IN_PROGRESS" | "READY" | "EMPTY";

type ApiCashierTable = {
  tableNumber: number;
  status: ApiCashierStatus | ApiCashierStatus[];
  itemCount: number;
  totalValue: number;
};

const statusLabel: Record<StatusMesa, string> = {
  "Pedido Feito": "Pedido Feito",
  "Em Preparo": "Em Preparo",
  "Comida Pronta": "Comida Pronta",
  Vazia: "Vazia",
};

const statusColor: Record<
  StatusMesa,
  { border: string; color: string; background: string }
> = {
  "Pedido Feito": {
    border: "2px solid #3B82F6",
    color: "#2563EB",
    background: "#F0F6FF",
  },
  "Em Preparo": {
    border: "2px solid #F59E0B",
    color: "#B45309",
    background: "#FFF7ED",
  },
  "Comida Pronta": {
    border: "2px solid #22C55E",
    color: "#16A34A",
    background: "#F0FFF4",
  },
  Vazia: {
    border: "2px solid #E5E7EB",
    color: "#6B7280",
    background: "#F9FAFB",
  },
};

const getStatusFromApi = (status: ApiCashierStatus | ApiCashierStatus[]): StatusMesa => {
  if (status === "EMPTY") return "Vazia";

  const statuses = Array.isArray(status) ? status : [status];
  if (statuses.includes("READY")) return "Comida Pronta";
  if (statuses.includes("IN_PROGRESS")) return "Em Preparo";
  if (statuses.includes("PENDING")) return "Pedido Feito";
  return "Pedido Feito";
};

export function CashierPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { refreshCount } = useSocket();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusMesa | "Todos">("Todos");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["cashier-tables"],
    queryFn: () => apiFetch<ApiCashierTable[]>("/api/orders/cashier"),
  });

  useEffect(() => {
    if (refreshCount > 0) {
      queryClient.invalidateQueries({ queryKey: ["cashier-tables"] });
    }
  }, [refreshCount, queryClient]);

  const mesas = useMemo<Mesa[]>(() => {
    return (data ?? []).map((table) => ({
      id: table.tableNumber,
      status: getStatusFromApi(table.status),
      itemCount: table.itemCount,
      totalValue: table.totalValue,
    }));
  }, [data]);

  const filteredMesas = useMemo(() => {
    return mesas.filter((mesa) => {
      const matchesSearch = String(mesa.id).includes(search.trim());
      const matchesStatus = statusFilter === "Todos" || mesa.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [mesas, search, statusFilter]);

  const totals = useMemo(() => {
    return mesas.reduce(
      (acc, mesa) => {
        acc.tables += 1;
        acc.items += mesa.itemCount;
        acc.revenue += mesa.totalValue;
        if (mesa.status !== "Vazia") {
          acc.openTables += 1;
        }
        return acc;
      },
      { tables: 0, openTables: 0, items: 0, revenue: 0 },
    );
  }, [mesas]);

  const handleSelecionarMesa = (mesa: Mesa) => {
    navigate(`/payment/${mesa.id}`);
  };

  return (
    <div style={{ padding: "32px 0", background: "#FAFAFA", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Selecionar Mesa para Pagamento</h1>
        <div style={{ color: "#6B7280", fontSize: 18, marginBottom: 32 }}>
          Escolha uma mesa para realizar o pagamento
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div style={{ background: "#fff", borderRadius: 12, padding: 12, border: "1px solid #E5E7EB" }}>
            <div style={{ fontSize: 12, color: "#6B7280" }}>Mesas Totais</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{totals.tables}</div>
          </div>
          <div style={{ background: "#fff", borderRadius: 12, padding: 12, border: "1px solid #E5E7EB" }}>
            <div style={{ fontSize: 12, color: "#6B7280" }}>Mesas Ativas</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{totals.openTables}</div>
          </div>
          <div style={{ background: "#fff", borderRadius: 12, padding: 12, border: "1px solid #E5E7EB" }}>
            <div style={{ fontSize: 12, color: "#6B7280" }}>Itens em aberto</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{totals.items}</div>
          </div>
          <div style={{ background: "#fff", borderRadius: 12, padding: 12, border: "1px solid #E5E7EB" }}>
            <div style={{ fontSize: 12, color: "#6B7280" }}>Total aberto</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>R$ {totals.revenue.toFixed(2)}</div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 24,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar mesa por número"
            style={{
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: 10,
              padding: "10px 12px",
              minWidth: 220,
              fontSize: 14,
            }}
          />
          {(["Todos", "Vazia", "Pedido Feito", "Em Preparo", "Comida Pronta"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                border: statusFilter === status ? "2px solid #2563EB" : "1px solid #E5E7EB",
                borderRadius: 999,
                padding: "8px 14px",
                background: statusFilter === status ? "#EFF6FF" : "#fff",
                color: statusFilter === status ? "#2563EB" : "#4B5563",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {status}
            </button>
          ))}
        </div>

        {isLoading && (
          <div style={{ color: "#6B7280", fontSize: 16, marginBottom: 16 }}>
            Carregando mesas...
          </div>
        )}

        {isError && (
          <div style={{ color: "#B91C1C", fontSize: 16, marginBottom: 16 }}>
            Erro ao carregar mesas.
          </div>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
            gap: 20
          }}
        >
          {filteredMesas.map((mesa) => {
            const style = statusColor[mesa.status];
            return (
              <button
                key={mesa.id}
                onClick={() => handleSelecionarMesa(mesa)}
                style={{
                  borderRadius: 16,
                  border: style.border,
                  background: style.background,
                  color: style.color,
                  padding: "32px 0 24px 0",
                  textAlign: "center",
                  fontWeight: 600,
                  fontSize: 22,
                  boxShadow: "0 1px 4px 0 rgba(0,0,0,0.03)",
                  opacity: 1,
                  cursor: "pointer",
                  transition: "box-shadow 0.2s",
                  outline: "none"
                }}
              >
                <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
                  {mesa.id}
                </div>
                <div style={{ fontSize: 18, fontWeight: 500 }}>
                  {statusLabel[mesa.status]}
                </div>
                <div
                  style={{
                    marginTop: 24,
                    paddingTop: 16,
                    borderTop: `1px solid ${style.color}26`,
                    display: "flex",
                    justifyContent: "space-between",
                    paddingLeft: 24,
                    paddingRight: 24
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", opacity: 0.8 }}>Itens</span>
                    <span style={{ fontSize: 18, fontWeight: 600 }}>{mesa.itemCount}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", opacity: 0.8 }}>Total</span>
                    <span style={{ fontSize: 18, fontWeight: 700 }}>R$ {mesa.totalValue.toFixed(2)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CashierPage;