import { useState, type FormEvent } from "react";
import { Plus, Search, X } from "lucide-react";
import { api } from "../lib/api";
import {
  money,
  productSchema,
  type Category,
  type Product,
} from "../lib/domain";
import { useAction, useResource } from "../lib/hooks";
import {
  Empty,
  Feedback,
  Field,
  Heading,
  Loading,
  ProductImage,
  Submit,
} from "../components/ui";
export default function Inventory() {
  const products = useResource<Product[]>("/products/inventory");
  const categories = useResource<Category[]>("/categories");
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const action = useAction();
  const creation = useAction();
  function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    void creation.run(async () => {
      const data = productSchema.parse(values);
      if (editing) {
        await api.patch(`/products/${editing.id}`, {
          ...data,
          description: data.description ?? null,
          imageUrl: data.imageUrl ?? null,
        });
      } else {
        await api.post("/products", data);
      }
      form.reset();
      setOpen(false);
      products.refresh();
      action.setSuccess(
        editing
          ? "Produto atualizado com sucesso."
          : "Produto cadastrado. Ele já está disponível no cardápio.",
      );
    });
  }
  const list = (products.data || []).filter((p) =>
    p.name
      .toLocaleLowerCase("pt-BR")
      .includes(search.toLocaleLowerCase("pt-BR")),
  );
  return (
    <>
      <Heading
        eyebrow="CARDÁPIO"
        title="Seus produtos"
        action={
          <button
            className="btn primary"
            disabled={creation.busy}
            onClick={() => {
              setEditing(null);
              creation.setError("");
              setOpen((v) => !v);
            }}
          >
            {open ? <X size={17} /> : <Plus size={17} />}{" "}
            {open ? "Cancelar" : "Novo produto"}
          </button>
        }
      >
        Organize o cardápio e escolha o que está disponível.
      </Heading>
      {open && (
        <section className="panel mb-6">
          <h2 className="mb-5">
            {editing ? "Editar produto" : "Cadastrar produto"}
          </h2>
          <form
            key={editing?.id ?? "new"}
            onSubmit={create}
            className="form-grid"
          >
            <Field label="Nome">
              <input
                name="name"
                defaultValue={editing?.name ?? ""}
                maxLength={100}
                required
              />
            </Field>
            <Field label="Preço (R$)">
              <input
                name="price"
                defaultValue={editing?.price ?? ""}
                inputMode="decimal"
                placeholder="24,90"
                required
              />
            </Field>
            <Field label="Categoria">
              <select
                name="categoryId"
                required
                defaultValue={editing?.categoryId ?? ""}
              >
                <option value="" disabled>
                  Selecione uma categoria
                </option>
                {categories.data?.map((c) => (
                  <option value={c.id} key={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="URL da imagem (opcional)">
              <input
                name="imageUrl"
                defaultValue={editing?.imageUrl ?? ""}
                type="url"
                placeholder="https://…"
              />
            </Field>
            <div className="full">
              <Field label="Descrição (opcional)">
                <textarea
                  name="description"
                  defaultValue={editing?.description ?? ""}
                  maxLength={150}
                  rows={2}
                />
              </Field>
            </div>
            <div className="full">
              <Feedback error={creation.error} />
              {!categories.data?.length && (
                <p className="fine">
                  Cadastre uma categoria antes de criar produtos.
                </p>
              )}
              <Submit busy={creation.busy || !categories.data?.length}>
                Salvar produto
              </Submit>
            </div>
          </form>
        </section>
      )}
      <Feedback
        error={products.error || categories.error || action.error}
        success={action.success}
      />
      {products.error && (
        <button className="btn secondary" onClick={products.refresh}>
          Tentar novamente
        </button>
      )}
      <div className="search max-w-md mb-6">
        <Search size={18} />
        <input
          placeholder="Buscar produto"
          aria-label="Buscar produto"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {products.loading ? (
        <Loading />
      ) : !list.length ? (
        <Empty title="Nenhum produto encontrado">
          Cadastre seu primeiro produto ou ajuste a busca.
        </Empty>
      ) : (
        <div className="inventory-list">
          {list.map((p) => (
            <article className="inventory-row" key={p.id}>
              <ProductImage url={p.imageUrl} name={p.name} />
              <div className="inventory-name">
                <h3>{p.name}</h3>
                <p>
                  {categories.data?.find((c) => c.id === p.categoryId)?.name ||
                    "Categoria"}
                </p>
              </div>
              <strong>{money(p.price)}</strong>
              <button
                className="btn secondary"
                disabled={creation.busy}
                aria-label={`Editar ${p.name}`}
                onClick={() => {
                  setEditing(p);
                  setOpen(true);
                  creation.setError("");
                  action.setSuccess("");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Editar
              </button>
              <button
                className={`availability ${p.available ? "on" : ""}`}
                role="switch"
                aria-checked={p.available}
                aria-label={`Disponibilidade de ${p.name}`}
                disabled={action.busy}
                onClick={() =>
                  void action.run(async () => {
                    await api.patch(`/products/${p.id}/availability`, {
                      available: !p.available,
                    });
                    products.refresh();
                  })
                }
              >
                <span className="switch-track">
                  <span />
                </span>
                <span>{p.available ? "Disponível" : "Indisponível"}</span>
              </button>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
