import { useEffect, useMemo } from "react";
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
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: 24,
          }}
        >
          {mesas.map((mesa) => {
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