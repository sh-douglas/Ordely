import { useCallback, useEffect, useRef, useState } from "react";
import { api, errorMessage } from "./api";
export function useResource<T>(path: string, interval = 0) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((v) => v + 1), []);
  useEffect(() => {
    let alive = true;
    let busy = false;
    const controller = new AbortController();
    setLoading(true);
    setData(null);
    setError("");
    const load = async () => {
      if (busy) return;
      busy = true;
      try {
        const res = await api.get<T>(path, { signal: controller.signal });
        if (alive) {
          setData(res.data);
          setError("");
        }
      } catch (e) {
        if (alive) setError(errorMessage(e));
      } finally {
        busy = false;
        if (alive) setLoading(false);
      }
    };
    void load();
    const timer = interval
      ? window.setInterval(() => {
          if (!document.hidden) void load();
        }, interval)
      : undefined;
    return () => {
      alive = false;
      controller.abort();
      window.clearInterval(timer);
    };
  }, [path, version, interval]);
  return { data, error, loading, refresh };
}
export function useAction() {
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  async function run(action: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await action();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return { busy, error, success, setError, setSuccess, run };
}
