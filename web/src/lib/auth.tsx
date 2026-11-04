import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Navigate, useLocation } from "react-router";
import { api, setToken, tokenKey } from "./api";
import type { Employee } from "./domain";
const Context = createContext<{
  employee: Employee | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}>(null!);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const logout = () => {
    setToken(null);
    setEmployee(null);
  };
  useEffect(() => {
    let active = true;
    if (sessionStorage.getItem(tokenKey))
      api
        .get<Employee>("/auth/me")
        .then((r) => {
          if (active) setEmployee(r.data);
        })
        .catch(() => {
          if (active) logout();
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    else setLoading(false);
    const expired = () => setEmployee(null);
    window.addEventListener("ordely:unauthorized", expired);
    return () => {
      active = false;
      window.removeEventListener("ordely:unauthorized", expired);
    };
  }, []);
  async function login(email: string, password: string) {
    const { data } = await api.post<{ token: string; employee: Employee }>(
      "/auth/signin",
      { email, password },
    );
    setToken(data.token);
    setEmployee(data.employee);
  }
  return (
    <Context.Provider value={{ employee, loading, login, logout }}>
      {children}
    </Context.Provider>
  );
}
export const useAuth = () => useContext(Context);
export function Protected({ children }: { children: ReactNode }) {
  const { employee, loading } = useAuth();
  const location = useLocation();
  if (loading)
    return (
      <div className="empty" role="status">
        Verificando sua sessão…
      </div>
    );
  if (!employee)
    return (
      <Navigate to="/entrar" replace state={{ from: location.pathname }} />
    );
  return children;
}
