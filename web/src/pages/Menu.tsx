import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowUpRight,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { api } from "../lib/api";
import {
  cartTotal,
  checkoutSchema,
  money,
  paymentLabel,
  type CartLine,
  type Category,
  type Order,
  type Product,
} from "../lib/domain";
import { useAction, useResource } from "../lib/hooks";
import {
  Empty,
  Feedback,
  Field,
  Loading,
  ProductImage,
  Submit,
} from "../components/ui";
export default function Menu() {
  const menu = useResource<Product[]>("/products/menu");
  const categories = useResource<Category[]>("/categories");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [checkout, setCheckout] = useState(false);
  const action = useAction();
  const navigate = useNavigate();
  const count = cart.reduce((sum, l) => sum + l.quantity, 0);
  const filtered = (menu.data || []).filter(
    (p) =>
      (category === "all" || p.categoryId === category) &&
      `${p.name} ${p.description || ""}`
        .toLocaleLowerCase("pt-BR")
        .includes(search.toLocaleLowerCase("pt-BR")),
  );
  function change(product: Product, delta: number) {
    setCart((current) => {
      const found = current.find((l) => l.product.id === product.id);
      if (!found && delta > 0) return [...current, { product, quantity: 1 }];
      return current
        .map((l) =>
          l.product.id === product.id
            ? { ...l, quantity: Math.min(99, l.quantity + delta) }
            : l,
        )
        .filter((l) => l.quantity > 0);
    });
  }
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    void action.run(async () => {
      const body = checkoutSchema.parse({
        ...Object.fromEntries(form),
        items: cart.map((l) => ({
          productId: l.product.id,
          quantity: l.quantity,
        })),
      });
      const { data } = await api.post<Order>("/orders", body);
      setCart([]);
      if (data.trackingCode) navigate(`/acompanhar/${data.trackingCode}`);
      else {
        setCheckout(false);
        action.setSuccess(
          `Pedido #${data.id} recebido. Consulte o atendimento para acompanhar.`,
        );
      }
    });
  }
  return (
    <div className="public-width">
      <section className="menu-hero">
        <div>
          <span className="hero-label">
            <span />
            FEITO PARA O SEU MOMENTO
          </span>
          <h1>
            Seu próximo pedido.
            <br />
            <em>Sem complicação.</em>
          </h1>
          <p>
            Escolha seus favoritos, envie seu pedido e acompanhe
            <br className="hidden md:block" /> cada etapa até a hora de retirar.
          </p>
          <Link to="/acompanhar" className="hero-link">
            Já fez um pedido? Acompanhe aqui <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="plate">
            <div className="plate-inner">
              <UtensilMark />
            </div>
          </div>
          <span className="art-note">
            feito na hora
            <br />
            <strong>para você.</strong>
          </span>
        </div>
      </section>
      <div className="menu-layout">
        <section>
          <div className="section-title">
            <div>
              <p className="eyebrow">ESCOLHA DO SEU JEITO</p>
              <h2>Nosso cardápio</h2>
            </div>
            <span className="muted">
              {menu.data?.length ?? "—"}{" "}
              {menu.data?.length === 1 ? "opção" : "opções"}
            </span>
          </div>
          <div className="search">
            <Search size={19} />
            <input
              aria-label="Buscar no cardápio"
              placeholder="O que você está procurando?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="chips" aria-label="Categorias">
            <button
              className={category === "all" ? "chip active" : "chip"}
              onClick={() => setCategory("all")}
            >
              Todos
            </button>
            {categories.data?.map((c) => (
              <button
                className={category === c.id ? "chip active" : "chip"}
                onClick={() => setCategory(c.id)}
                key={c.id}
              >
                {c.name}
              </button>
            ))}
          </div>
          <Feedback error={menu.error || categories.error} />
          {menu.error && (
            <button className="btn secondary" onClick={menu.refresh}>
              Tentar novamente
            </button>
          )}
          {menu.loading ? (
            <Loading />
          ) : !filtered.length && !menu.error ? (
            <Empty
              title={
                menu.data?.length
                  ? "Nenhum resultado por aqui"
                  : "O cardápio está sendo preparado"
              }
            >
              {menu.data?.length
                ? "Tente outro nome ou categoria."
                : "Volte em instantes para conferir as opções disponíveis."}
            </Empty>
          ) : (
            <div className="product-grid">
              {filtered.map((p) => (
                <article className="product-card" key={p.id}>
                  <ProductImage url={p.imageUrl} name={p.name} />
                  <div className="product-content">
                    <span className="eyebrow">
                      {p.category?.name || "No cardápio"}
                    </span>
                    <h3>{p.name}</h3>
                    <p>
                      {p.description ||
                        "Preparado com cuidado para o seu pedido."}
                    </p>
                    <div className="product-bottom">
                      <strong>{money(p.price)}</strong>
                      <button
                        className="add-button"
                        aria-label={`Adicionar ${p.name}`}
                        onClick={() => change(p, 1)}
                        disabled={action.busy}
                      >
                        <Plus size={19} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
        <aside className="cart panel" id="sacola">
          <div className="section-title">
            <h2>
              <ShoppingBag size={21} /> Sua sacola
            </h2>
            <span className="count">{count}</span>
          </div>
          {!cart.length ? (
            <Empty title="Ainda está vazia">
              Adicione algo gostoso do cardápio para começar.
            </Empty>
          ) : (
            <>
              <div className="cart-lines">
                {cart.map((l) => (
                  <div className="cart-line" key={l.product.id}>
                    <div>
                      <strong>{l.product.name}</strong>
                      <small>{money(l.product.price)}</small>
                    </div>
                    <div className="quantity">
                      <button
                        aria-label={`Diminuir ${l.product.name}`}
                        disabled={action.busy}
                        onClick={() => change(l.product, -1)}
                      >
                        <Minus size={13} />
                      </button>
                      <span>{l.quantity}</span>
                      <button
                        aria-label={`Aumentar ${l.product.name}`}
                        disabled={action.busy || l.quantity >= 99}
                        onClick={() => change(l.product, 1)}
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="total">
                <span>Total estimado</span>
                <strong>{money(cartTotal(cart))}</strong>
              </div>
              <p className="fine">
                O total final é confirmado pelo estabelecimento ao receber o
                pedido.
              </p>
              {!checkout ? (
                <button
                  className="btn primary w-full"
                  onClick={() => setCheckout(true)}
                >
                  Continuar pedido <ArrowUpRight size={18} />
                </button>
              ) : (
                <form onSubmit={submit} className="form-stack">
                  <h3>Quase pronto!</h3>
                  <Field label="Seu nome">
                    <input
                      name="customerName"
                      autoComplete="name"
                      placeholder="Como podemos chamar você?"
                      required
                    />
                  </Field>
                  <Field label="Celular com DDD">
                    <input
                      name="customerPhone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </Field>
                  <Field label="Forma de pagamento">
                    <select name="paymentMethod">
                      {Object.entries(paymentLabel).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <p className="fine">
                    Pagamento combinado na retirada. Nenhuma cobrança é
                    realizada neste site.
                  </p>
                  <Submit busy={action.busy}>Enviar pedido</Submit>
                  <button
                    className="text-button"
                    type="button"
                    disabled={action.busy}
                    onClick={() => setCheckout(false)}
                  >
                    Voltar à sacola
                  </button>
                </form>
              )}
              <button
                className="text-button cart-clear"
                disabled={action.busy}
                onClick={() => {
                  setCart([]);
                  setCheckout(false);
                }}
              >
                <Trash2 size={14} /> Limpar sacola
              </button>
            </>
          )}
          <Feedback error={action.error} success={action.success} />
        </aside>
      </div>
    </div>
  );
}
function UtensilMark() {
  return (
    <svg
      viewBox="0 0 100 100"
      width="110"
      height="110"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M26 19v22c0 13 20 13 20 0V19M36 19v61M69 80V19c-13 10-14 30 0 32" />
    </svg>
  );
}
