import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../api/client";
import { useSocket } from "../socket";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

type PaymentMethod = "ONLINE" | "CASH";
type TipPreset = 0 | 5 | 10 | 15;

const formatMoney = (value: number) => `R$ ${value.toFixed(2)}`;

const CheckoutForm = ({
  onPaymentSuccess,
  payableAmount,
}: {
  onPaymentSuccess: () => void;
  payableAmount: number;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage("");

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required", // Prevent automatic redirect to allow calling the backend success route
    });

    if (error) {
      setErrorMessage(error.message ?? "Erro no pagamento online.");
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      onPaymentSuccess();
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {errorMessage && (
        <div style={{ color: "red", marginTop: 12, fontSize: 14 }}>
          {errorMessage}
        </div>
      )}
      <button
        disabled={isProcessing || !stripe || !elements}
        style={{
          width: "100%",
          padding: "16px",
          marginTop: 24,
          borderRadius: 12,
          background: isProcessing ? "#9CA3AF" : "#16A34A",
          color: "#fff",
          border: "none",
          fontSize: 16,
          fontWeight: 700,
          cursor: isProcessing ? "not-allowed" : "pointer",
          boxShadow: isProcessing
            ? "none"
            : "0 4px 6px -1px rgba(22, 163, 74, 0.4)",
          transition: "all 0.2s",
        }}
      >
        {isProcessing ? "Processando..." : `Confirmar Pgt. (${formatMoney(payableAmount)})`}
      </button>
    </form>
  );
};


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
  const [clientSecret, setClientSecret] = useState<string>("");
  const [confirmCashOpen, setConfirmCashOpen] = useState(false);
  const [tipPreset, setTipPreset] = useState<TipPreset>(0);
  const [useCustomTip, setUseCustomTip] = useState(false);
  const [customTipInput, setCustomTipInput] = useState("");
  const [splitCount, setSplitCount] = useState(1);

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

  const orders = data?.orders ?? [];
  const tableTotal = data?.tableTotal ?? 0;

  const customTipValue = useMemo(() => {
    const parsed = Number(customTipInput.replace(",", "."));
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  }, [customTipInput]);

  const tipAmount = useMemo(() => {
    if (useCustomTip) {
      return customTipValue;
    }
    return (tableTotal * tipPreset) / 100;
  }, [tableTotal, tipPreset, useCustomTip, customTipValue]);

  const payableAmount = useMemo(() => tableTotal + tipAmount, [tableTotal, tipAmount]);
  const splitValue = useMemo(() => payableAmount / splitCount, [payableAmount, splitCount]);

  useEffect(() => {
    if (selectedMethod !== "ONLINE") {
      return;
    }

    if (payableAmount > 0) {
      apiFetch<{ clientSecret: string }>("/api/payments/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: payableAmount,
          tableNumber,
          currency: "brl",
        }),
      })
        .then((res) => setClientSecret(res.clientSecret))
        .catch((err) => console.error("Erro ao gerar payment intent", err));
    }
  }, [selectedMethod, payableAmount, tableNumber]);

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

  const handlePay = () => {
    if (!selectedMethod) {
      alert("Selecione um método de pagamento.");
      return;
    }
    
    // For CASH, open the Material UI modal instead of using window.confirm
    if (selectedMethod === "CASH") {
      setConfirmCashOpen(true);
    }
  };

  const handleConfirmCash = () => {
    setConfirmCashOpen(false);
    payMutation.mutate();
  };

  const handleCancelCash = () => {
    setConfirmCashOpen(false);
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

            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#374151" }}>
                Gorjeta
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 8 }}>
                {([0, 5, 10, 15] as TipPreset[]).map((tip) => {
                  const active = !useCustomTip && tipPreset === tip;
                  return (
                    <button
                      key={tip}
                      onClick={() => {
                        setUseCustomTip(false);
                        setTipPreset(tip);
                      }}
                      style={{
                        padding: "8px 6px",
                        borderRadius: 8,
                        border: active ? "2px solid #2563EB" : "1px solid #E5E7EB",
                        background: active ? "#EFF6FF" : "#fff",
                        color: active ? "#2563EB" : "#374151",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 12,
                      }}
                    >
                      {tip}%
                    </button>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setUseCustomTip((prev) => !prev)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: useCustomTip ? "2px solid #2563EB" : "1px solid #E5E7EB",
                    background: useCustomTip ? "#EFF6FF" : "#fff",
                    color: useCustomTip ? "#2563EB" : "#374151",
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Valor custom
                </button>
                <input
                  value={customTipInput}
                  onChange={(event) => setCustomTipInput(event.target.value)}
                  disabled={!useCustomTip}
                  placeholder="Ex: 8.50"
                  style={{
                    flex: 1,
                    border: "1px solid #E5E7EB",
                    borderRadius: 8,
                    padding: "8px 10px",
                    fontSize: 12,
                    background: useCustomTip ? "#fff" : "#F9FAFB",
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#374151" }}>
                Dividir Conta
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
                  <button
                    key={count}
                    onClick={() => setSplitCount(count)}
                    style={{
                      padding: "8px 6px",
                      borderRadius: 8,
                      border: splitCount === count ? "2px solid #2563EB" : "1px solid #E5E7EB",
                      background: splitCount === count ? "#EFF6FF" : "#fff",
                      color: splitCount === count ? "#2563EB" : "#374151",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: 12,
                    }}
                  >
                    {count}x
                  </button>
                ))}
              </div>
            </div>
            
            <div style={{ borderTop: "2px solid #F3F4F6", margin: "20px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ color: "#6B7280" }}>Gorjeta</span>
              <span style={{ fontWeight: 600 }}>{formatMoney(tipAmount)}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ color: "#6B7280" }}>Por pessoa ({splitCount}x)</span>
              <span style={{ fontWeight: 600 }}>{formatMoney(splitValue)}</span>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32, alignItems: "center" }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>Total a Pagar</span>
              <span style={{ fontSize: 32, fontWeight: 800, color: "#111827" }}>
                {formatMoney(payableAmount)}
              </span>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "#374151" }}>
                Método de Pagamento
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {(["ONLINE", "CASH"] as PaymentMethod[]).map((method) => {
                  const isActive = selectedMethod === method;
                  const labels = { ONLINE: "Cartão / Pix", CASH: "Dinheiro" };
                  return (
                    <button
                      key={method}
                      onClick={() => {
                        setClientSecret("");
                        setSelectedMethod(method);
                      }}
                      style={{
                        padding: "16px 8px",
                        borderRadius: 12,
                        border: isActive ? "2px solid #2563EB" : "1px solid #E5E7EB",
                        background: isActive ? "#EFF6FF" : "#fff",
                        color: isActive ? "#2563EB" : "#4B5563",
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
                      {labels[method]}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedMethod === "ONLINE" && clientSecret && (
              <div style={{ marginTop: 24 }}>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm
                    payableAmount={payableAmount}
                    onPaymentSuccess={() => payMutation.mutate()}
                  />
                </Elements>
              </div>
            )}

            {selectedMethod === "ONLINE" && !clientSecret && (
              <div style={{ marginTop: 18, fontSize: 13, color: "#6B7280" }}>
                Preparando pagamento online...
              </div>
            )}

            {selectedMethod !== "ONLINE" && (
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
                {payMutation.isPending ? "Processando..." : "Confirmar Pagamento em Dinheiro"}
              </button>
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={confirmCashOpen}
        onClose={handleCancelCash}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          style: { borderRadius: 12, padding: "8px" }
        }}
      >
        <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 700, pb: 1 }}>
          {"Confirmar Pagamento"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{ color: "#374151" }}>
            Você está prestes a registrar o pagamento em <strong>dinheiro/espécie</strong> no valor total de <strong style={{color: "#111827"}}>{formatMoney(payableAmount)}</strong>.
            <br/><br/>
            Divisão sugerida: <strong>{splitCount}x de {formatMoney(splitValue)}</strong>.
            <br/><br/>
            Deseja confirmar e finalizar a conta da Mesa {tableNumber}?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={handleCancelCash} 
            sx={{ color: "#6B7280", fontWeight: 600, textTransform: "none" }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmCash} 
            variant="contained" 
            sx={{ background: "#16A34A", "&:hover": { background: "#15803D" }, fontWeight: 600, textTransform: "none", borderRadius: 2 }}
            autoFocus
          >
            Confirmar Pagamento
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PaymentPage;