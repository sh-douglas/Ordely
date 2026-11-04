import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Check, Copy, RefreshCw } from "lucide-react";
import {
  Badge,
  Empty,
  Feedback,
  Field,
  Heading,
  Loading,
  Submit,
} from "../components/ui";
import {
  dateTime,
  money,
  paymentLabel,
  statusLabel,
  trackingSchema,
  type Order,
  type Status,
} from "../lib/domain";
import { useAction, useResource } from "../lib/hooks";
export default function Tracking() {
  const { code } = useParams();
  const navigate = useNavigate();
  const action = useAction();
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = String(
      new FormData(e.currentTarget).get("code") || "",
    ).trim();
    void action.run(async () => {
      navigate(`/acompanhar/${trackingSchema.parse(value)}`);
    });
  }
  return (
    <div className="tracking-width">
      <Link to="/" className="back-link">
        <ArrowLeft size={16} /> Voltar ao cardápio
      </Link>
      <Heading eyebrow="CADA ETAPA, BEM DE PERTO" title="Acompanhe seu pedido">
        Da cozinha até você. Consulte o andamento por aqui.
      </Heading>
      {!code ? (
        <div className="panel">
          <form className="form-stack" onSubmit={submit}>
            <Field
              label="Código de acompanhamento"
              hint="Use o código recebido ao finalizar seu pedido."
            >
              <input name="code" placeholder="Cole seu código aqui" required />
            </Field>
            <Feedback error={action.error} />
            <Submit busy={action.busy}>Buscar pedido</Submit>
          </form>
        </div>
      ) : !trackingSchema.safeParse(code).success ? (
        <>
          <Feedback error="Este código não é válido. Confira o link do pedido." />
          <Link className="btn secondary" to="/acompanhar">
            Informar outro código
          </Link>
        </>
      ) : (
        <OrderTracking code={code} />
      )}
    </div>
  );
}
function OrderTracking({ code }: { code: string }) {
  const order = useResource<Order>(`/orders/track/${code}`, 10000);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2500);
    return () => clearTimeout(timer);
  }, [copied]);
  const steps: Status[] = ["PENDING", "IN_PROGRESS", "READY", "COMPLETED"];
  const data = order.data;
  return (
    <>
      <Feedback error={order.error} />
      {order.loading ? (
        <Loading />
      ) : !data ? (
        <Empty title="Não conseguimos carregar o pedido">
          <button className="text-button" onClick={order.refresh}>
            Tentar novamente
          </button>
        </Empty>
      ) : (
        <>
          <div className="panel tracking-card">
            <div className="section-title">
              <div>
                <p className="eyebrow">PEDIDO</p>
                <h2>#{String(data.id).padStart(3, "0")}</h2>
              </div>
              <Badge status={data.status} />
            </div>
            <h3 className="tracking-greeting">
              {data.status === "READY"
                ? `${data.customerName}, pode vir buscar!`
                : data.status === "COMPLETED"
                  ? "Pedido concluído. Obrigado!"
                  : data.status === "CANCELED"
                    ? "Este pedido foi cancelado."
                    : `${data.customerName}, estamos cuidando do seu pedido.`}
            </h3>
            <p className="muted">
              {data.status === "READY"
                ? "Seu pedido está pronto para retirada no estabelecimento."
                : data.status === "CANCELED"
                  ? "Para mais informações, fale com o atendimento."
                  : `Recebido em ${dateTime(data.createdAt)}.`}
            </p>
            {data.status !== "CANCELED" && (
              <ol className="steps">
                {steps.map((status, i) => (
                  <li
                    key={status}
                    className={i <= steps.indexOf(data.status) ? "done" : ""}
                  >
                    <span>
                      {i < steps.indexOf(data.status) ? (
                        <Check size={16} />
                      ) : (
                        i + 1
                      )}
                    </span>
                    <small>{statusLabel[status]}</small>
                  </li>
                ))}
              </ol>
            )}
            <div className="order-items">
              {data.orderItems?.map((item, i) => (
                <div key={i}>
                  <span>
                    {item.quantity} × {item.product.name}
                  </span>
                  <strong>
                    {money(Number(item.unitPrice) * item.quantity)}
                  </strong>
                </div>
              ))}
            </div>
            <div className="total">
              <span>{paymentLabel[data.paymentMethod]}</span>
              <strong>{money(data.total)}</strong>
            </div>
          </div>
          <div className="tracking-tools">
            <span className="muted">
              Atualização automática a cada 10 segundos
            </span>
            <button className="text-button" onClick={order.refresh}>
              <RefreshCw size={15} /> Atualizar
            </button>
          </div>
          <div className="panel save-link">
            <h3>Guarde o link do seu pedido</h3>
            <p>Ele permite acompanhar o pedido sem precisar de uma conta.</p>
            <code>{code}</code>
            <button
              className="btn secondary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(window.location.href);
                  setCopied(true);
                  setCopyError("");
                } catch {
                  setCopyError(
                    "Não foi possível copiar. Copie o endereço na barra do navegador.",
                  );
                }
              }}
            >
              <Copy size={16} />
              {copied ? "Link copiado" : "Copiar link de acompanhamento"}
            </button>
            <Feedback error={copyError} />
          </div>
        </>
      )}
    </>
  );
}
