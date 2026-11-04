import type { FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { ArrowLeft, ChefHat } from "lucide-react";
import { useAuth } from "../lib/auth";
import { loginSchema } from "../lib/domain";
import { useAction } from "../lib/hooks";
import { Feedback, Field, Submit } from "../components/ui";
export default function Login() {
  const auth = useAuth();
  const action = useAction();
  const navigate = useNavigate();
  const location = useLocation();
  if (auth.employee) return <Navigate to="/painel" replace />;
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget));
    void action.run(async () => {
      const v = loginSchema.parse(values);
      await auth.login(v.email, v.password);
      const from = location.state?.from;
      navigate(
        typeof from === "string" && from.startsWith("/painel")
          ? from
          : "/painel",
        { replace: true },
      );
    });
  }
  return (
    <div className="login-layout">
      <section className="login-story">
        <ChefHat size={42} />
        <p className="eyebrow">MENOS CORRERIA. MAIS CONTROLE.</p>
        <h1>
          Um atendimento
          <br />
          que flui.
        </h1>
        <p>
          Todos os pedidos, produtos e sua equipe no mesmo lugar. Entre e deixe
          o dia mais organizado.
        </p>
        <span className="story-footer">ordely. · feito para facilitar</span>
      </section>
      <section className="login-form">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Voltar ao cardápio
        </Link>
        <h1>Bom ter você aqui.</h1>
        <p className="subtitle">Entre na área da equipe para começar.</p>
        <form onSubmit={submit} className="form-stack">
          <Field label="E-mail">
            <input
              name="email"
              type="email"
              autoComplete="username"
              placeholder="voce@estabelecimento.com"
              required
            />
          </Field>
          <Field label="Senha">
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Sua senha"
              required
            />
          </Field>
          <Feedback error={action.error} />
          <Submit busy={action.busy || auth.loading}>Entrar no painel</Submit>
        </form>
        <p className="fine mt-6">
          Precisa de acesso? Peça a um funcionário autorizado para cadastrar sua
          conta.
        </p>
      </section>
    </div>
  );
}
