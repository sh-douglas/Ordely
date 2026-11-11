import { useState, type FormEvent } from "react";
import { Tags, UserPlus } from "lucide-react";
import { api } from "../lib/api";
import {
  categorySchema,
  employeeSchema,
  type Category,
  type Employee,
} from "../lib/domain";
import { useAction, useResource } from "../lib/hooks";
import {
  Empty,
  Feedback,
  Field,
  Heading,
  Loading,
  Submit,
} from "../components/ui";
export function Categories() {
  const [editing, setEditing] = useState<Category | null>(null);
  const categories = useResource<Category[]>("/categories");
  const action = useAction();
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    void action.run(async () => {
      const data = categorySchema.parse(values);
      if (editing) await api.patch(`/categories/${editing.id}`, data);
      else await api.post("/categories", data);
      setEditing(null);
      form.reset();
      categories.refresh();
      action.setSuccess(
        editing
          ? "Categoria atualizada com sucesso."
          : "Categoria cadastrada com sucesso.",
      );
    });
  }
  return (
    <>
      <Heading eyebrow="CARDÁPIO" title="Categorias">
        Um cardápio organizado começa por aqui.
      </Heading>
      <div className="management-grid">
        <section className="panel">
          <div className="form-icon">
            <Tags size={23} />
          </div>
          <h2>{editing ? "Editar categoria" : "Nova categoria"}</h2>
          <p className="subtitle">Agrupe produtos para facilitar a escolha.</p>
          <form
            key={editing?.id ?? "new"}
            onSubmit={submit}
            className="form-stack mt-6"
          >
            <Field label="Nome da categoria">
              <input
                defaultValue={editing?.name ?? ""}
                name="name"
                placeholder="Ex.: Lanches, bebidas, sobremesas"
                maxLength={50}
                required
              />
            </Field>
            <Feedback error={action.error} success={action.success} />
            <Submit busy={action.busy}>
              {editing ? "Salvar categoria" : "Cadastrar categoria"}
            </Submit>
            {editing && (
              <button
                type="button"
                className="btn secondary"
                disabled={action.busy}
                onClick={() => {
                  setEditing(null);
                  action.setError("");
                }}
              >
                Cancelar
              </button>
            )}
          </form>
        </section>
        <section>
          <Feedback error={categories.error} />
          {categories.error && (
            <button className="btn secondary" onClick={categories.refresh}>
              Tentar novamente
            </button>
          )}
          {categories.loading ? (
            <Loading />
          ) : !categories.data?.length ? (
            <Empty title="Nenhuma categoria ainda">
              Crie a primeira para começar seu cardápio.
            </Empty>
          ) : (
            <div className="category-list">
              {categories.data.map((c, i) => (
                <div key={c.id}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <h3>{c.name}</h3>
                  <button
                    className="btn secondary"
                    disabled={action.busy}
                    aria-label={`Editar ${c.name}`}
                    onClick={() => {
                      setEditing(c);
                      action.setError("");
                      action.setSuccess("");
                    }}
                  >
                    Editar
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
export function Team() {
  const employees = useResource<Employee[]>("/auth/employees");
  const action = useAction();
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    void action.run(async () => {
      await api.post("/auth/signup", employeeSchema.parse(values));
      employees.refresh();
      form.reset();
      action.setSuccess(
        "Funcionário cadastrado. A conta já pode acessar o painel.",
      );
    });
  }
  return (
    <>
      <Heading eyebrow="PESSOAS" title="Sua equipe">
        Dê acesso a quem faz o atendimento acontecer.
      </Heading>
      <div className="management-grid">
        <section className="panel">
          <div className="form-icon">
            <UserPlus size={23} />
          </div>
          <h2>Cadastrar funcionário</h2>
          <p className="subtitle">
            A nova conta terá acesso às operações do painel.
          </p>
          <form onSubmit={submit} className="form-grid mt-6">
            <Field label="Nome">
              <input name="name" autoComplete="name" required />
            </Field>
            <Field label="E-mail">
              <input name="email" type="email" autoComplete="email" required />
            </Field>
            <Field label="Senha">
              <input
                name="password"
                type="password"
                minLength={6}
                autoComplete="new-password"
                required
              />
            </Field>
            <Field label="Confirmar senha">
              <input
                name="confirmPassword"
                type="password"
                minLength={6}
                autoComplete="new-password"
                required
              />
            </Field>
            <div className="full">
              <Feedback error={action.error} success={action.success} />
              <Submit busy={action.busy}>Criar acesso</Submit>
            </div>
          </form>
        </section>
        <section className="panel">
          <h2>Funcionários cadastrados</h2>
          <Feedback error={employees.error} />
          {employees.error ? (
            <button className="btn secondary" onClick={employees.refresh}>
              Tentar novamente
            </button>
          ) : employees.loading ? (
            <Loading />
          ) : !employees.data?.length ? (
            <Empty title="Nenhum funcionário cadastrado">
              Cadastre o primeiro acesso.
            </Empty>
          ) : (
            <ul className="employee-list">
              {employees.data.map((employee) => (
                <li key={employee.id}>
                  <h3>{employee.name}</h3>
                  <p>{employee.email}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
