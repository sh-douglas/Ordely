import { ArrowRight, Search } from "lucide-react";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <section className="not-found" aria-labelledby="not-found-title">
      <div className="not-found-code" aria-hidden="true">
        404
      </div>
      <p className="eyebrow">PÁGINA NÃO ENCONTRADA</p>
      <h1 id="not-found-title">Esse endereço saiu do cardápio.</h1>
      <p className="subtitle">
        O link pode estar incorreto ou a página pode ter mudado. Você pode
        voltar ao cardápio ou consultar seu pedido pelo código de
        acompanhamento.
      </p>
      <div className="not-found-actions">
        <Link to="/" className="btn primary">
          Voltar ao cardápio <ArrowRight size={17} />
        </Link>
        <Link to="/acompanhar" className="btn secondary">
          <Search size={17} /> Acompanhar pedido
        </Link>
      </div>
      <Link to="/entrar" className="text-button">
        Acessar área da equipe
      </Link>
    </section>
  );
}
