import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

type Categoria = "Todos" | "Entradas" | "Pratos Principais" | "Sobremesas" | "Bebidas";

type ItemMenu = {
  id: number;
  nome: string;
  preco: number;
  categoria: Categoria;
};

type PedidoAgrupado = {
  [id: number]: {
    item: ItemMenu;
    qtd: number;
    notes: string;
  };
};

const menu: ItemMenu[] = [
  { id: 1, nome: "Caesar Salad", preco: 12.99, categoria: "Entradas" },
  { id: 2, nome: "Bruschetta", preco: 10.99, categoria: "Entradas" },
  { id: 3, nome: "Calamari", preco: 14.99, categoria: "Entradas" },
  { id: 4, nome: "Sopa do Dia", preco: 8.99, categoria: "Entradas" },
  { id: 5, nome: "Salmão Grelhado", preco: 26.99, categoria: "Pratos Principais" },
  { id: 6, nome: "Ribeye Steak", preco: 32.99, categoria: "Pratos Principais" },
  { id: 7, nome: "Frango à Parmegiana", preco: 22.99, categoria: "Pratos Principais" },
  { id: 8, nome: "Pasta Carbonara", preco: 18.99, categoria: "Pratos Principais" },
  { id: 9, nome: "Pizza Margherita", preco: 15.99, categoria: "Pratos Principais" },
  { id: 10, nome: "Tiramisu", preco: 8.99, categoria: "Sobremesas" },
  { id: 11, nome: "Cheesecake", preco: 8.99, categoria: "Sobremesas" },
  { id: 12, nome: "Refrigerante", preco: 3.99, categoria: "Bebidas" }
];

const categoriaPT = {
  "Todos": "Todos",
  "Entradas": "Entradas",
  "Pratos Principais": "Pratos Principais",
  "Sobremesas": "Sobremesas",
  "Bebidas": "Bebidas"
};

export default function CreateOrderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const mesaId = id ? parseInt(id, 10) : 0;

  const [categoria, setCategoria] = useState<Categoria>("Todos");
  // pedido: { [id]: { item, qtd, notes } }
  const [pedido, setPedido] = useState<PedidoAgrupado>({});

  function adicionarItem(item: ItemMenu) {
    setPedido(prev => ({
      ...prev,
      [item.id]: {
        ...prev[item.id],
        item,
        qtd: prev[item.id] ? prev[item.id].qtd + 1 : 1,
        notes: prev[item.id]?.notes || ""
      }
    }));
  }

  function removerItem(itemId: number) {
    setPedido(prev => {
      if (!prev[itemId]) return prev;
      if (prev[itemId].qtd <= 1) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          qtd: prev[itemId].qtd - 1
        }
      };
    });
  }

  function atualizarNotas(itemId: number, notes: string) {
    setPedido(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        notes
      }
    }));
  }

  function finalizarPedido() {
    alert(`Pedido da mesa ${mesaId} enviado para a cozinha!`);
    navigate("/dashboard/waiter");
  }

  const itensFiltrados =
    categoria === "Todos"
      ? menu
      : menu.filter(item => item.categoria === categoria);

  const total = Object.values(pedido).reduce(
    (sum, { item, qtd }) => sum + item.preco * qtd,
    0
  );

  return (
    <div style={{ background: "#F7F9FB", minHeight: "100vh", padding: 0 }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "32px 0 0 0"
      }}>
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
          <button
            onClick={() => navigate("/dashboard/waiter")}
            style={{
              background: "none",
              border: "none",
              color: "#6366F1",
              fontWeight: 500,
              fontSize: 16,
              cursor: "pointer",
              marginRight: 16
            }}
          >
            ← Voltar para Mesas
          </button>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#222" }}>Mesa {mesaId}</div>
            <div style={{ fontSize: 15, color: "#888", marginTop: 2 }}>Criar Pedido</div>
          </div>
        </div>

        {/* Filtros */}
        <div style={{
          display: "flex",
          gap: 12,
          marginBottom: 24,
          maxWidth: 900,
          marginLeft: "auto",
          marginRight: "auto"
        }}>
          {(["Todos", "Entradas", "Pratos Principais", "Sobremesas", "Bebidas"] as Categoria[]).map(cat => (
            <button
              key={cat}
              onClick={() => setCategoria(cat)}
              style={{
                padding: "10px 28px",
                borderRadius: 999,
                border: "none",
                fontWeight: 600,
                fontSize: 16,
                background: categoria === cat ? "#2563EB" : "#F3F4F6",
                color: categoria === cat ? "#fff" : "#222",
                boxShadow: categoria === cat ? "0 2px 8px 0 #2563eb22" : undefined,
                cursor: "pointer",
                transition: "all 0.15s"
              }}
            >
              {categoriaPT[cat]}
            </button>
          ))}
        </div>

        {/* Conteúdo principal */}
        <div style={{
          display: "flex",
          gap: 32,
          alignItems: "flex-start",
          maxWidth: 1200,
          margin: "0 auto"
        }}>
          {/* Menu */}
          <div style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 24
          }}>
            {itensFiltrados.map(item => (
              <div
                key={item.id}
                onClick={() => adicionarItem(item)}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  boxShadow: "0 2px 8px 0 #0001",
                  padding: "24px 20px",
                  cursor: "pointer",
                  border: "1.5px solid #F3F4F6",
                  transition: "box-shadow 0.15s, border 0.15s",
                  minHeight: 120
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 18, color: "#222", marginBottom: 4 }}>
                  {item.nome}
                </div>
                <div style={{ color: "#888", fontSize: 15, marginBottom: 8 }}>
                  {categoriaPT[item.categoria]}
                </div>
                <div style={{ color: "#2563EB", fontWeight: 700, fontSize: 20 }}>
                  R$ {item.preco.toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Pedido atual */}
          <div style={{
            width: 370,
            minHeight: 220,
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 2px 12px 0 #0001",
            padding: "28px 24px"
          }}>
            <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 18 }}>
              Pedido Atual
            </div>
            {Object.keys(pedido).length === 0 && (
              <div style={{ color: "#A0AEC0", fontSize: 16, marginTop: 24 }}>
                Nenhum item adicionado ainda
              </div>
            )}
            {Object.values(pedido).map(({ item, qtd, notes }) => (
              <div key={item.id} style={{
                marginBottom: 22,
                borderBottom: "1px solid #F3F4F6",
                paddingBottom: 16
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontWeight: 600,
                  fontSize: 16,
                  marginBottom: 4
                }}>
                  <span>{item.nome}</span>
                  <span>R$ {(item.preco * qtd).toFixed(2)}</span>
                </div>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 8
                }}>
                  <button
                    onClick={() => removerItem(item.id)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      border: "none",
                      background: "#F3F4F6",
                      color: "#444",
                      fontSize: 22,
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >−</button>
                  <span style={{ fontWeight: 700, fontSize: 18 }}>{qtd}</span>
                  <button
                    onClick={() => adicionarItem(item)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      border: "none",
                      background: "#2563EB",
                      color: "#fff",
                      fontSize: 22,
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >+</button>
                </div>
                <input
                  type="text"
                  placeholder="Notas especiais (ex: sem cebola)"
                  value={notes}
                  onChange={e => atualizarNotas(item.id, e.target.value)}
                  style={{
                    width: "100%",
                    border: "1px solid #E5E7EB",
                    borderRadius: 8,
                    padding: "8px 10px",
                    fontSize: 15,
                    color: "#222"
                  }}
                />
              </div>
            ))}
            {/* Total */}
            {Object.keys(pedido).length > 0 && (
              <>
                <div style={{
                  borderTop: "1px solid #F3F4F6",
                  margin: "18px 0 10px 0",
                  paddingTop: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 700,
                  fontSize: 20
                }}>
                  <span>Total</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
                <button
                  onClick={finalizarPedido}
                  style={{
                    marginTop: 10,
                    width: "100%",
                    background: "#22C55E",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 17,
                    border: "none",
                    borderRadius: 10,
                    padding: "14px 0",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px 0 #22c55e22"
                  }}
                >
                  Enviar para a Cozinha
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}