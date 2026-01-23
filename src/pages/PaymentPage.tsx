import React, { useState } from "react";
import { useParams } from "react-router-dom";

const mockOrder = {
  id: "order-demo-2",
  items: [
    { name: "Grilled Salmon", quantity: 1, price: 26.99 },
    { name: "Pasta Carbonara", quantity: 1, price: 18.99 },
    { name: "Soup of the Day", quantity: 2, price: 8.99, note: "Extra hot" }
  ]
};

function getOrderTotal(items: any[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

const PaymentPage: React.FC = () => {
  const { id } = useParams();
  const [discount, setDiscount] = useState(0);

  const subtotal = getOrderTotal(mockOrder.items);
  const total = Math.max(0, subtotal - discount);

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100vh", padding: 0 }}>
      <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
        {/* Orders Card */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 1px 8px 0 rgba(0,0,0,0.06)",
            padding: 32,
            minWidth: 400,
            marginRight: 40,
            flex: "0 0 420px"
          }}
        >
          <div style={{ color: "#6B7280", fontWeight: 600, marginBottom: 16 }}>Order ID</div>
          <div style={{ color: "#6B7280", fontFamily: "monospace", fontSize: 15, marginBottom: 24 }}>
            {mockOrder.id.slice(0, 10)}...
          </div>
          {mockOrder.items.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 18
              }}
            >
              <div>
                <div style={{ fontWeight: 500 }}>{item.name}</div>
                {item.note && (
                  <div style={{ color: "#6B7280", fontSize: 13, fontStyle: "italic" }}>{item.note}</div>
                )}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{item.quantity}x</div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>
                  ${ (item.price * item.quantity).toFixed(2) }
                </div>
              </div>
            </div>
          ))}
          <div style={{ borderTop: "1px solid #E5E7EB", margin: "24px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 18 }}>
            <span>Order Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Bill Summary Card */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 1px 8px 0 rgba(0,0,0,0.06)",
            padding: 32,
            minWidth: 340,
            height: "fit-content"
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 24 }}>Bill Summary</div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ color: "#6B7280" }}>Subtotal</span>
            <span style={{ color: "#6B7280" }}>${subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 24, marginBottom: 24 }}>
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: "#374151", fontWeight: 500, marginBottom: 6 }}>Apply Discount</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="number"
                min={0}
                value={discount}
                onChange={e => setDiscount(Number(e.target.value))}
                style={{
                  border: "1px solid #E5E7EB",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 16,
                  width: 100
                }}
              />
              <button
                style={{
                  background: "#2563EB",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 14px",
                  fontWeight: 700,
                  fontSize: 18,
                  cursor: "pointer"
                }}
                disabled
              >
                %
              </button>
            </div>
          </div>
          <button
            style={{
              width: "100%",
              background: "#22C55E",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "14px 0",
              fontWeight: 700,
              fontSize: 18,
              marginBottom: 16,
              cursor: "pointer"
            }}
          >
            Proceed to Payment
          </button>
          <button
            style={{
              width: "100%",
              background: "#6B7280",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "14px 0",
              fontWeight: 700,
              fontSize: 18,
              cursor: "pointer"
            }}
          >
            Close Table (No Payment)
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div
        style={{
          position: "fixed",
          left: 24,
          bottom: 24,
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 1px 8px 0 rgba(0,0,0,0.06)",
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          gap: 24,
          fontSize: 16
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 700 }}>9</span> Active
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ background: "#F87171", borderRadius: "50%", width: 16, height: 16, display: "inline-block" }}></span>
          <span style={{ color: "#F87171", fontWeight: 600 }}>3 New</span>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ background: "#FBBF24", borderRadius: "50%", width: 16, height: 16, display: "inline-block" }}></span>
          <span style={{ color: "#FBBF24", fontWeight: 600 }}>2 Cooking</span>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ background: "#22C55E", borderRadius: "50%", width: 16, height: 16, display: "inline-block" }}></span>
          <span style={{ color: "#22C55E", fontWeight: 600 }}>4 Ready</span>
        </span>
      </div>
    </div>
  );
};

export default PaymentPage;