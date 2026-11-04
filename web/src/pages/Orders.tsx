import { useState } from "react";
import {
  RefreshCw,
  ArrowRight,
  Clock3,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";
import { api } from "../lib/api";
import {
  dateTime,
  money,
  paymentLabel,
  statusLabel,
  transitions,
  type Order,
  type Status,
} from "../lib/domain";
import { useAction, useResource } from "../lib/hooks";
import { Badge, Empty, Feedback, Heading, Loading } from "../components/ui";
export default function Orders({ history = false }: { history?: boolean }) {
  const orders = useResource<Order[]>(
    history ? "/orders/history" : "/orders",
    history ? 0 : 10000,
  );
  const action = useAction();
  const [filter, setFilter] = useState("all");
  const [cancel, setCancel] = useState<number | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const data = orders.data || [];
  const visible = data.filter((o) => filter === "all" || o.status === filter);
  const list: Status[] = history
    ? ["COMPLETED", "CANCELED"]
    : ["PENDING", "IN_PROGRESS", "READY"];
  function update(order: Order, status: Status) {
    void action.run(async () => {
      setUpdating(order.id);
      try {
        await api.patch(`/orders/${order.id}/status`, { status });
        setCancel(null);
        orders.refresh();
      } finally {
        setUpdating(null);
      }
    });
  }
  return (
    <>
      <Heading
        eyebrow="OPERAÇÃO"
        title={history ? "Histórico de pedidos" : "Pedidos em andamento"}
        action={
          <button className="btn secondary" onClick={orders.refresh}>
            <RefreshCw size={16} /> Atualizar
          </button>
        }
      >
        {history
          ? "Consulte os pedidos concluídos e cancelados."
          : "Da chegada à retirada, acompanhe cada etapa."}
      </Heading>
      {!history && (
        <div className="stat-grid">
          {list.map((status, i) => {
            const Icon = [ClipboardList, Clock3, CheckCircle2][i];
            return (
              <div className="stat" key={status}>
                <span className={`stat-icon tone-${i}`}>
                  <Icon size={21} />
                </span>
                <div>
                  <p>{statusLabel[status]}</p>
                  <strong>
                    {orders.loading
                      ? "—"
                      : data.filter((o) => o.status === status).length}
                  </strong>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="toolbar">
        <div className="chips">
          <button
            className={filter === "all" ? "chip active" : "chip"}
            onClick={() => setFilter("all")}
          >
            Todos <span>{data.length}</span>
          </button>
          {list.map((status) => (
            <button
              key={status}
              className={filter === status ? "chip active" : "chip"}
              onClick={() => setFilter(status)}
            >
              {statusLabel[status]}
            </button>
          ))}
        </div>
        {!history && (
          <span className="live-label">
            <span />
            Atualiza a cada 10s
          </span>
        )}
      </div>
      <Feedback error={orders.error || action.error} />
      {orders.loading ? (
        <Loading />
      ) : !visible.length ? (
        <Empty
          title={
            history ? "Nenhum pedido no histórico" : "Tudo em dia por aqui"
          }
        >
          {history
            ? "Pedidos finalizados aparecerão aqui."
            : "Os novos pedidos do cardápio aparecerão nesta tela."}
        </Empty>
      ) : (
        <div className="order-grid">
          {visible.map((order) => (
            <article className="panel order-card" key={order.id}>
              <div className="section-title">
                <span className="order-number">
                  #{String(order.id).padStart(3, "0")}
                </span>
                <Badge status={order.status} />
              </div>
              <h3>{order.customerName}</h3>
              <p className="muted text-sm">
                {dateTime(order.createdAt)}
                {order.customerPhone ? ` · ${order.customerPhone}` : ""}
              </p>
              <div className="order-items">
                {order.orderItems?.map((item, i) => (
                  <div key={i}>
                    <span>
                      <b>{item.quantity}×</b> {item.product.name}
                    </span>
                    <span>{money(Number(item.unitPrice) * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="total">
                <span>{paymentLabel[order.paymentMethod]}</span>
                <strong>{money(order.total)}</strong>
              </div>
              {!history && (
                <div className="order-actions">
                  {transitions[order.status]
                    .filter((s) => s !== "CANCELED")
                    .map((s) => (
                      <button
                        className="btn primary"
                        key={s}
                        disabled={action.busy}
                        onClick={() => update(order, s)}
                      >
                        {updating === order.id
                          ? "Atualizando…"
                          : {
                              IN_PROGRESS: "Iniciar preparo",
                              READY: "Marcar como pronto",
                              COMPLETED: "Confirmar retirada",
                            }[s as "IN_PROGRESS" | "READY" | "COMPLETED"]}
                        <ArrowRight size={15} />
                      </button>
                    ))}
                  {transitions[order.status].includes("CANCELED") &&
                    (cancel === order.id ? (
                      <div className="cancel-confirm">
                        <p>
                          Cancelar este pedido? Essa ação não pode ser desfeita.
                        </p>
                        <button
                          className="text-button danger"
                          disabled={action.busy}
                          onClick={() => update(order, "CANCELED")}
                        >
                          Sim, cancelar
                        </button>
                        <button
                          className="text-button"
                          disabled={action.busy}
                          onClick={() => setCancel(null)}
                        >
                          Manter pedido
                        </button>
                      </div>
                    ) : (
                      <button
                        className="text-button"
                        disabled={action.busy}
                        onClick={() => setCancel(order.id)}
                      >
                        Cancelar pedido
                      </button>
                    ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
