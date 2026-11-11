import { Link, NavLink, Outlet, Route, Routes } from "react-router";
import {
  ClipboardList,
  History,
  LayoutGrid,
  LogOut,
  Tags,
  Users,
  ArrowUpRight,
  ShoppingBag,
} from "lucide-react";
import { Brand } from "./components/ui";
import { Protected, useAuth } from "./lib/auth";
import Menu from "./pages/Menu";
import NotFound from "./pages/NotFound";
import Tracking from "./pages/Tracking";
import Login from "./pages/Login";
import Orders from "./pages/Orders";
import Inventory from "./pages/Inventory";
import { Categories, Team } from "./pages/Management";
function PublicLayout() {
  return (
    <>
      <header className="public-header">
        <div>
          <Brand />
          <nav aria-label="Navegação principal">
            <NavLink to="/" end>
              Cardápio
            </NavLink>
            <NavLink to="/acompanhar">Acompanhar pedido</NavLink>
            <Link to="/entrar" className="team-link">
              Área da equipe <ArrowUpRight size={15} />
            </Link>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="public-footer">
        <Brand />
        <span>Seu pedido, no seu tempo.</span>
        <span>Feito para facilitar o atendimento.</span>
      </footer>
    </>
  );
}
function AdminLayout() {
  const { employee, logout } = useAuth();
  const links = [
    ["/painel", "Pedidos", ClipboardList],
    ["/painel/historico", "Histórico", History],
    ["/painel/produtos", "Produtos", LayoutGrid],
    ["/painel/categorias", "Categorias", Tags],
    ["/painel/equipe", "Equipe", Users],
  ] as const;
  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <Brand />
        <p className="sidebar-caption">ÁREA DA EQUIPE</p>
        <nav aria-label="Painel da equipe">
          {links.map(([to, label, Icon]) => (
            <NavLink to={to} end key={to}>
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link to="/" className="menu-shortcut">
            <ShoppingBag size={17} /> Ver cardápio <ArrowUpRight size={15} />
          </Link>
          <div className="profile">
            <span>{employee?.name.slice(0, 1).toUpperCase()}</span>
            <div>
              <strong>{employee?.name}</strong>
              <small>Equipe Ordely</small>
            </div>
            <button aria-label="Sair da conta" title="Sair" onClick={logout}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <span>Seu atendimento, organizado.</span>
          <div className="flex items-center gap-4">
            <span className="workspace-label">Painel de gestão</span>
            <button
              className="mobile-logout"
              aria-label="Sair da conta no celular"
              onClick={logout}
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Menu />} />
        <Route path="acompanhar" element={<Tracking />} />
        <Route path="acompanhar/:code" element={<Tracking />} />
        <Route path="entrar" element={<Login />} />
      </Route>
      <Route
        path="painel"
        element={
          <Protected>
            <AdminLayout />
          </Protected>
        }
      >
        <Route index element={<Orders />} />
        <Route path="historico" element={<Orders key="history" history />} />
        <Route path="produtos" element={<Inventory />} />
        <Route path="categorias" element={<Categories />} />
        <Route path="equipe" element={<Team />} />
      </Route>
      <Route element={<PublicLayout />}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
