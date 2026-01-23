import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiFetch } from "../api/client";
import { UseAuth } from "../auth/AuthContext";

type Categoria = "Todos" | string;

type ItemMenu = {
  id: string;
  nome: string;
  preco: number;
  categoria: Categoria;
};

type PedidoAgrupado = {
  [id: string]: {
    item: ItemMenu;
    qtd: number;
    notes: string;
  };
};

type ApiItem = {
  id: string;
  name: string;
  price: string;
};

type ApiItensResponse = Record<string, ApiItem[]>;

const buildItens = (data: ApiItensResponse | undefined): ItemMenu[] => {
  if (!data) return [];
  return Object.entries(data).flatMap(([categoria, itens]) =>
    itens.map((item) => ({
      id: item.id,
      nome: item.name,
      preco: Number(item.price),
      categoria,
    })),
  );
};

export default function CreateOrderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = UseAuth();
  const mesaId = id ?? "";
  const mesaNumero = (location.state as { tableNumber?: number } | null)?.tableNumber;

  const [categoria, setCategoria] = useState<Categoria>("Todos");
  // pedido: { [id]: { item, qtd, notes } }
  const [pedido, setPedido] = useState<PedidoAgrupado>({});

  const itensQuery = useQuery({
    queryKey: ["menu-itens"],
    queryFn: () => apiFetch<ApiItensResponse>("/api/itens"),
  });

  const itensMenu = useMemo(() => buildItens(itensQuery.data), [itensQuery.data]);

  const categoriasDisponiveis = useMemo(() => {
    const categorias = new Set<Categoria>();
    itensMenu.forEach((item) => categorias.add(item.categoria));
    return ["Todos" as Categoria, ...Array.from(categorias)];
  }, [itensMenu]);

  const criarPedido = useMutation({
    mutationFn: async () => {
      if (!mesaId || !userId) {
        throw new Error("Mesa ou usuário inválido.");
      }

      const items = Object.values(pedido).map(({ item, qtd }) => ({
        menuItemId: item.id,
        quantity: qtd,
      }));

      const notes = Object.values(pedido)
        .map(({ item, notes }) => (notes ? `${item.nome}: ${notes}` : ""))
        .filter(Boolean)
        .join(" | ");

      return apiFetch("/api/orders/create", {
        method: "POST",
        body: JSON.stringify({
          tableId: mesaId,
          waiterId: userId,
          notes: notes || undefined,
          items,
        }),
      });
    },
    onSuccess: () => {
      setPedido({});
      navigate("/dashboard/waiter");
    },
  });

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

  function removerItem(itemId: string) {
    setPedido(prev => {
      if (!prev[itemId]) return prev;
      if (prev[itemId].qtd <= 1) {
        const next = { ...prev };
        delete next[itemId];
        return next;
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

  function atualizarNotas(itemId: string, notes: string) {
    setPedido(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        notes
      }
    }));
  }

  function finalizarPedido() {
    criarPedido.mutate();
  }

  const itensFiltrados =
    categoria === "Todos"
      ? itensMenu
      : itensMenu.filter(item => item.categoria === categoria);

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
            <div style={{ fontSize: 28, fontWeight: 700, color: "#222" }}>
              Mesa {mesaNumero ?? mesaId}
            </div>
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
          {categoriasDisponiveis.map(cat => (
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
              {cat}
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
            {itensQuery.isLoading && (
              <div style={{ color: "#6B7280", fontSize: 16 }}>
                Carregando itens...
              </div>
            )}

            {itensQuery.isError && (
              <div style={{ color: "#B91C1C", fontSize: 16 }}>
                Erro ao carregar itens.
              </div>
            )}

            {!itensQuery.isLoading && !itensQuery.isError && itensFiltrados.length === 0 && (
              <div style={{ color: "#6B7280", fontSize: 16 }}>
                Nenhum item encontrado.
              </div>
            )}

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
                  {item.categoria}
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
                  disabled={criarPedido.isPending || !userId}
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
                  {criarPedido.isPending ? "Enviando..." : "Enviar para a Cozinha"}
                </button>
                {!userId && (
                  <div style={{ color: "#B91C1C", fontSize: 14, marginTop: 10 }}>
                    Usuário não autenticado.
                  </div>
                )}
                {criarPedido.isError && (
                  <div style={{ color: "#B91C1C", fontSize: 14, marginTop: 10 }}>
                    {criarPedido.error instanceof Error
                      ? criarPedido.error.message
                      : "Erro ao enviar pedido."}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}