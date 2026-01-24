import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../api/client";
import { useSocket } from "../socket";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

type PaymentMethod = "DEBIT" | "CREDIT" | "CASH";

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  note?: string;
};

type Order = {
  orderId: string;
  status: string;
  createdAt: string;
  items: CartItem[];
  orderTotal: number;
};

type TableData = {
  tableNumber: number;
  orders: Order[];
  tableTotal: number;
};

const PaymentPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const tableNumber = Number(id);
  const { refreshCount } = useSocket();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  useEffect(() => {
    if (refreshCount > 0) {
      queryClient.invalidateQueries({ queryKey: ["payment-table", tableNumber] });
    }
  }, [refreshCount, queryClient, tableNumber]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["payment-table", tableNumber],
    queryFn: () =>
      apiFetch<TableData>("/api/orders/table", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableNumber }),
      }),
    enabled: !isNaN(tableNumber),
  });

  const payMutation = useMutation({
    mutationFn: async () => {
      return apiFetch("/api/orders/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableNumber }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cashier-tables"] });
      queryClient.invalidateQueries({ queryKey: ["payment-table", tableNumber] });
      navigate("/dashboard/cashier");
    },
    onError: (err) => {
      console.error("Payment failed", err);
    },
  });

  if (isNaN(tableNumber)) {
    return <div>Mesa inválida.</div>;
  }

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
        Carregando dados da mesa...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 48, color: "red" }}>
        Erro ao carregar pedidos da mesa.
      </div>
    );
  }

  const { orders, tableTotal } = data;

  const handlePay = () => {
    if (!selectedMethod) {
      alert("Selecione um método de pagamento.");
      return;
    }
    if (confirm(`Confirmar pagamento de R$ ${tableTotal.toFixed(2)}?`)) {
      payMutation.mutate();
    }
  };

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100vh", padding: 0 }}>
      {/* Header */}
      <div
        style={{
          background: "#fff",
          padding: "20px 32px",
          borderBottom: "1px solid #E5E7EB",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <button
          onClick={() => navigate("/dashboard/cashier")}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            padding: 8,
            borderRadius: "50%",
          }}
        >
          <ArrowBackIcon sx={{ color: "#374151" }} />
        </button>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#111827" }}>
          Pagamento - Mesa {tableNumber}
        </h1>
      </div>

      <div style={{ display: "flex", justifyContent: "center", padding: "48px 24px", gap: 40, flexWrap: "wrap" }}>
        {/* Left Column: Order Details */}
        <div style={{ flex: "1 1 400px", maxWidth: 600 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24, color: "#374151" }}>
            Detalhes dos Pedidos
          </h2>
          
          {orders.length === 0 ? (
            <div style={{ color: "#6B7280" }}>Nenhum pedido encontrado.</div>
          ) : (
            orders.map((order) => (
              <div
                key={order.orderId}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  boxShadow: "0 1px 3px 0 rgba(0,0,0,0.1)",
                  padding: 24,
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 16,
                    borderBottom: "1px solid #F3F4F6",
                    paddingBottom: 12,
                  }}
                >
                  <span style={{ fontSize: 13, color: "#9CA3AF", fontFamily: "monospace" }}>
                    ID: {order.orderId.split("-")[0]}...
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "4px 8px",
                      borderRadius: 6,
                      background: order.status === "READY" ? "#DEF7EC" : "#F3F4F6",
                      color: order.status === "READY" ? "#03543F" : "#374151",
                    }}
                  >
                    {order.status === "READY" ? "PRONTO" : order.status}
                  </span>
                </div>

                {order.items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 12,
                      fontSize: 15,
                    }}
                  >
                    <div style={{ display: "flex", gap: 12 }}>
                      <span style={{ fontWeight: 600, color: "#374151", minWidth: 24 }}>
                        {item.quantity}x
                      </span>
                      <div>
                        <div style={{ color: "#1F2937" }}>{item.name}</div>
                        {item.note && (
                          <div style={{ fontSize: 13, color: "#9CA3AF", fontStyle: "italic" }}>
                            {item.note}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ fontWeight: 500, color: "#111827" }}>
                      R$ {item.total.toFixed(2)}
                    </div>
                  </div>
                ))}
                
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: "1px dashed #E5E7EB",
                    gap: 16,
                    alignItems: "baseline"
                  }}
                >
                    <span style={{ fontSize: 13, color: "#6B7280" }}>Subtotal do Pedido</span>
                    <span style={{ fontSize: 16, fontWeight: 700 }}>R$ {order.orderTotal.toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Payment Summary */}
        <div style={{ flex: "0 0 380px" }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              padding: 32,
              position: "sticky",
              top: 24
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, color: "#111827" }}>Resumo da Conta</h2>
            
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ color: "#6B7280" }}>Total dos Itens</span>
              <span style={{ fontWeight: 600 }}>R$ {tableTotal.toFixed(2)}</span>
            </div>
            
            <div style={{ borderTop: "2px solid #F3F4F6", margin: "20px 0" }} />
            
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32, alignItems: "center" }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>Total a Pagar</span>
              <span style={{ fontSize: 32, fontWeight: 800, color: "#111827" }}>
                R$ {tableTotal.toFixed(2)}
              </span>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "#374151" }}>
                Método de Pagamento
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {(["DEBIT", "CREDIT", "CASH"] as PaymentMethod[]).map((method) => {
                  const isActive = selectedMethod === method;
                  const labels = { DEBIT: "Débito", CREDIT: "Crédito", CASH: "Dinheiro" };
                  return (
                    <button
                      key={method}
                      onClick={() => setSelectedMethod(method)}
                      style={{
                        padding: "12px 4px",
                        borderRadius: 8,
                        border: isActive ? "2px solid #2563EB" : "1px solid #E5E7EB",
                        background: isActive ? "#EFF6FF" : "#fff",
                        color: isActive ? "#2563EB" : "#4B5563",
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      {labels[method]}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handlePay}
              disabled={payMutation.isPending || !selectedMethod}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: 12,
                background: !selectedMethod || payMutation.isPending ? "#9CA3AF" : "#16A34A",
                color: "#fff",
                border: "none",
                fontSize: 16,
                fontWeight: 700,
                cursor: !selectedMethod || payMutation.isPending ? "not-allowed" : "pointer",
                boxShadow: !selectedMethod ? "none" : "0 4px 6px -1px rgba(22, 163, 74, 0.4)",
                transition: "all 0.2s"
              }}
            >
              {payMutation.isPending ? "Processando..." : "Confirmar Pagamento"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;