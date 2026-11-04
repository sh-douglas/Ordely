import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  PackageOpen,
  UtensilsCrossed,
} from "lucide-react";
import { Link } from "react-router";
import type { ReactNode } from "react";
import { statusLabel, type Status } from "../lib/domain";
export function Brand() {
  return (
    <Link to="/" className="brand" aria-label="Ordely, início">
      <span className="brand-icon">
        <UtensilsCrossed size={20} />
      </span>
      ordely<span className="brand-dot">.</span>
    </Link>
  );
}
export function Feedback({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  return (
    <>
      {error && (
        <div className="notice error" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="notice success" role="status">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}
    </>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      <PackageOpen size={32} />
      <h3>{title}</h3>
      {children && <p>{children}</p>}
    </div>
  );
}
export function Loading() {
  return (
    <div className="loading" role="status">
      <span className="spinner" />
      Carregando…
    </div>
  );
}
export function Badge({ status }: { status: Status }) {
  return (
    <span className={`badge ${status.toLowerCase()}`}>
      <span />
      {statusLabel[status]}
    </span>
  );
}
export function Heading({
  eyebrow,
  title,
  children,
  action,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {children && <p className="subtitle">{children}</p>}
      </div>
      {action}
    </div>
  );
}
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function Submit({
  busy,
  children,
}: {
  busy: boolean;
  children: ReactNode;
}) {
  return (
    <button className="btn primary" type="submit" disabled={busy}>
      {busy ? "Aguarde…" : children}
      {!busy && <ArrowRight size={17} />}
    </button>
  );
}
export function ProductImage({
  url,
  name,
}: {
  url?: string | null;
  name: string;
}) {
  return (
    <div className="product-image">
      {url && /^https?:\/\//i.test(url) ? (
        <img
          src={url}
          alt={name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : null}
      <UtensilsCrossed className="image-fallback" size={36} />
    </div>
  );
}
