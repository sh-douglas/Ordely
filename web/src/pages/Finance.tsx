import { useState, type FormEvent } from "react";
import { useResource } from "../lib/hooks";
import { money } from "../lib/domain";
import { Heading, Field, Feedback, Loading, Empty } from "../components/ui";
type Summary = {
  total: string;
  count: number;
  daily: { date: string; count: number; total: string }[];
};
export default function Finance() {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const result = useResource<Summary>(`/finance${query}`);
  function filter(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const from = String(data.get("from") || ""),
      to = String(data.get("to") || "");
    if (!from || !to || from > to) {
      setError(
        "Informe um período válido, com início anterior ou igual ao fim.",
      );
      return;
    }
    setError("");
    setQuery(`?from=${from}&to=${to}`);
  }
  return (
    <>
      <Heading eyebrow="GESTÃO" title="Financeiro">
        Vendas de pedidos concluídos, pela data de criação (horário de São
        Paulo).
      </Heading>
      <form className="panel form-grid mb-6" onSubmit={filter}>
        <Field label="Data inicial">
          <input name="from" type="date" required />
        </Field>
        <Field label="Data final">
          <input name="to" type="date" required />
        </Field>
        <button className="btn primary" type="submit">
          Filtrar período
        </button>
        <button
          className="btn secondary"
          type="reset"
          onClick={() => {
            setQuery("");
            setError("");
            result.refresh();
          }}
        >
          Todo o período
        </button>
      </form>
      <Feedback error={error || result.error} />
      {result.error && (
        <button className="btn secondary" onClick={result.refresh}>
          Tentar novamente
        </button>
      )}
      {result.loading ? (
        <Loading />
      ) : (
        result.data && (
          <>
            <div className="management-grid mb-6">
              <section className="panel">
                <h2>{query ? "Total no período" : "Total vendido"}</h2>
                <strong>{money(result.data.total)}</strong>
              </section>
              <section className="panel">
                <h2>Pedidos concluídos</h2>
                <strong>{result.data.count}</strong>
              </section>
            </div>
            {!result.data.daily.length ? (
              <Empty title="Nenhuma venda no período">
                Pedidos pendentes ou cancelados não entram no total.
              </Empty>
            ) : (
              <section className="panel">
                <h2>Vendas por dia</h2>
                <table className="finance-table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Pedidos</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.daily.map((row) => (
                      <tr key={row.date}>
                        <td>{row.date.split("-").reverse().join("/")}</td>
                        <td>{row.count}</td>
                        <td>{money(row.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}
          </>
        )
      )}
    </>
  );
}
