import { prisma } from "../lib/prisma.js";
import { Prisma } from "../generated/prisma/client.js";
export default {
  async daily(
    start?: Date,
    end?: Date,
    client: Prisma.TransactionClient = prisma,
  ) {
    return client.$queryRaw<
      { date: string; count: bigint; total: Prisma.Decimal }[]
    >(Prisma.sql`
      SELECT to_char(("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM-DD') AS date,
             count(*) AS count, sum(total) AS total
      FROM orders WHERE status = 'COMPLETED'
      ${start ? Prisma.sql`AND "createdAt" >= ${start}` : Prisma.empty}
      ${end ? Prisma.sql`AND "createdAt" < ${end}` : Prisma.empty}
      GROUP BY 1 ORDER BY 1`);
  },
};
