import { z } from "zod";
import { Prisma } from "../generated/prisma/client.js";
import financeRepository from "../repositories/finance-repository.js";
const date = z.iso.date();
export const financeQuery = z
  .object({ from: date.optional(), to: date.optional() })
  .refine((v) => Boolean(v.from) === Boolean(v.to), "Informe as duas datas.")
  .refine(
    (v) => !v.from || !v.to || v.from <= v.to,
    "A data inicial deve ser anterior ou igual à final.",
  );
export function financeRange(query: unknown) {
  const { from, to } = financeQuery.parse(query);
  // Current store timezone: America/Sao_Paulo (UTC-03).
  const start = from ? new Date(`${from}T00:00:00-03:00`) : undefined;
  const end = to
    ? new Date(new Date(`${to}T00:00:00-03:00`).getTime() + 86400000)
    : undefined;
  return { from, to, start, end };
}
export default async function financeSummary(query: unknown) {
  const range = financeRange(query);
  const rows = await financeRepository.daily(range.start, range.end);
  const total = rows.reduce(
    (sum, row) => sum.add(row.total),
    new Prisma.Decimal(0),
  );
  const count = rows.reduce((sum, row) => sum + Number(row.count), 0);
  return {
    total: total.toFixed(2),
    count,
    from: range.from ?? null,
    to: range.to ?? null,
    daily: rows.map((row) => ({
      date: row.date,
      count: Number(row.count),
      total: row.total.toFixed(2),
    })),
  };
}
