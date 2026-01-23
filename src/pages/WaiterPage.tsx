import React from "react";
import { useNavigate } from "react-router-dom"; // Adicione este import

export type StatusMesa = "Em Atendimento" | "Comida Pronta" | "Vazia";

export type Mesa = {
  id: number;
  status: StatusMesa;
  atendida?: boolean;
};

const mesas: Mesa[] = [
  { id: 1, status: "Em Atendimento" },
  { id: 2, status: "Em Atendimento" },
  { id: 3, status: "Comida Pronta" },
  { id: 4, status: "Comida Pronta" },
  { id: 5, status: "Em Atendimento" },
  { id: 6, status: "Vazia" },
  { id: 7, status: "Em Atendimento" },
  { id: 8, status: "Comida Pronta" },
  { id: 9, status: "Vazia" },
  { id: 10, status: "Em Atendimento" },
  { id: 11, status: "Vazia" },
  { id: 12, status: "Vazia" }
];

const statusLabel = {
  "Em Atendimento": "Em Atendimento",
  "Comida Pronta": "Comida Pronta",
  "Vazia": "Vazia"
};

const statusColor = {
  "Em Atendimento": {
    border: "2px solid #3B82F6",
    color: "#2563EB",
    background: "#F0F6FF"
  },
  "Comida Pronta": {
    border: "2px solid #22C55E",
    color: "#16A34A",
    background: "#F0FFF4"
  },
  "Vazia": {
    border: "2px solid #E5E7EB",
    color: "#6B7280",
    background: "#F9FAFB"
  }
};

export function WaiterPage() {
  const navigate = useNavigate();

  // Mesas vazias são as que ainda não fizeram pedido
  const handleSelecionarMesa = (mesa: Mesa) => {
    if (mesa.status === "Vazia") {
      navigate(`/create-order/${mesa.id}`);
    }
    // Aqui você pode adicionar outras lógicas para mesas já em atendimento ou comida pronta
  };

  const isMesaAtendida = (mesa: Mesa) =>
    mesa.status === "Comida Pronta" && mesa.atendida;

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
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: 24
          }}
        >
          {mesas.map((mesa) => {
            const style = statusColor[mesa.status];
            return (
              <button
                key={mesa.id}
                onClick={() => !isMesaAtendida(mesa) && handleSelecionarMesa(mesa)}
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
                  opacity: isMesaAtendida(mesa) ? 0.5 : 1,
                  cursor: isMesaAtendida(mesa) ? "not-allowed" : "pointer",
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
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}