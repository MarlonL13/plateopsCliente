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
  tableId: string;
  status: StatusMesa;
  atendida?: boolean;
};

type ApiOrder = {
  id: string;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

type ApiTable = {
  id: string;
  number: number;
  status: string;
  activeOrder: ApiOrder | "Nenhum pedido ativo" | null;
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

const isNoActiveOrder = (
  activeOrder: ApiTable["activeOrder"],
): activeOrder is "Nenhum pedido ativo" | null =>
  !activeOrder || typeof activeOrder === "string";

const translateOrderStatus = (status?: string): StatusMesa => {
  switch (status) {
    case "READY":
      return "Comida Pronta";
    case "DONE":
    case "DELIVERED":
    case "SERVED":
      return "Comida Pronta";
    case "PENDING":
      return "Pedido Feito";
    case "IN_PROGRESS":
      return "Em Preparo";
    default:
      return "Pedido Feito";
  }
};

const isOrderServed = (status?: string) =>
  ["DONE", "DELIVERED", "SERVED"].includes(status ?? "");

const mapTableToMesa = (table: ApiTable): Mesa => {
  if (isNoActiveOrder(table.activeOrder)) {
    return { id: table.number, tableId: table.id, status: "Vazia" };
  }

  const status = translateOrderStatus(table.activeOrder.status);
  return {
    id: table.number,
    tableId: table.id,
    status,
    atendida: status === "Comida Pronta" && isOrderServed(table.activeOrder.status),
  };
};

export function WaiterPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { refreshCount } = useSocket();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusMesa | "Todos">("Todos");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["tables"],
    queryFn: () => apiFetch<ApiTable[]>("/api/orders"),
  });

  useEffect(() => {
    if (refreshCount > 0) {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    }
  }, [refreshCount, queryClient]);

  const mesas = useMemo(() => (data ?? []).map(mapTableToMesa), [data]);

  const filteredMesas = useMemo(() => {
    return mesas.filter((mesa) => {
      const matchesSearch = String(mesa.id).includes(search.trim());
      const matchesStatus = statusFilter === "Todos" || mesa.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [mesas, search, statusFilter]);

  const statusTotals = useMemo(() => {
    return mesas.reduce(
      (acc, mesa) => {
        acc.total += 1;
        if (mesa.status === "Vazia") acc.empty += 1;
        if (mesa.status === "Pedido Feito") acc.pending += 1;
        if (mesa.status === "Em Preparo") acc.preparing += 1;
        if (mesa.status === "Comida Pronta") acc.ready += 1;
        return acc;
      },
      { total: 0, empty: 0, pending: 0, preparing: 0, ready: 0 },
    );
  }, [mesas]);

  const handleSelecionarMesa = (mesa: Mesa) => {
    navigate(`/create-order/${mesa.tableId}`, {
      state: { tableNumber: mesa.id },
    });
  };

  return (
    <div style={{ padding: "32px 0", background: "#FAFAFA", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Selecionar Mesa</h1>
        <div style={{ color: "#6B7280", fontSize: 18, marginBottom: 32 }}>
          Escolha uma mesa para criar ou visualizar pedidos
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
            <div style={{ fontSize: 12, color: "#6B7280" }}>Mesas</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{statusTotals.total}</div>
          </div>
          <div style={{ background: "#fff", borderRadius: 12, padding: 12, border: "1px solid #E5E7EB" }}>
            <div style={{ fontSize: 12, color: "#6B7280" }}>Pedido Feito</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#2563EB" }}>{statusTotals.pending}</div>
          </div>
          <div style={{ background: "#fff", borderRadius: 12, padding: 12, border: "1px solid #E5E7EB" }}>
            <div style={{ fontSize: 12, color: "#6B7280" }}>Em Preparo</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#B45309" }}>{statusTotals.preparing}</div>
          </div>
          <div style={{ background: "#fff", borderRadius: 12, padding: 12, border: "1px solid #E5E7EB" }}>
            <div style={{ fontSize: 12, color: "#6B7280" }}>Comida Pronta</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#16A34A" }}>{statusTotals.ready}</div>
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

        {!isLoading && !isError && mesas.length === 0 && (
          <div style={{ color: "#6B7280", fontSize: 16, marginBottom: 16 }}>
            Nenhuma mesa encontrada.
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 20,
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
                  cursor: "pointer",
                  transition: "box-shadow 0.2s",
                  outline: "none",
                }}
              >
                <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
                  {mesa.id}
                </div>
                <div style={{ fontSize: 18, fontWeight: 500 }}>
                  {statusLabel[mesa.status]}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}