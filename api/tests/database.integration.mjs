import assert from "node:assert/strict";
import { test, after } from "node:test";
import { randomUUID } from "node:crypto";
import { prisma } from "../src/lib/prisma.ts";
import finance from "../src/repositories/finance-repository.ts";
const rollback = new Error("ROLLBACK_TEST_FIXTURES");
after(() => prisma.$disconnect());
test("PostgreSQL: uniqueness, preserved history, role defaults and finance boundaries (rollback)", async () => {
  try {
    await prisma.$transaction(
      async (tx) => {
        const suffix = randomUUID();
        const category = await tx.category.create({
          data: { name: `Test ${suffix}` },
        });
        const name = `QA Meal ${suffix}`;
        const product = await tx.product.create({
          data: { name, price: "0.10", categoryId: category.id },
        });
        await tx.$executeRawUnsafe("SAVEPOINT duplicate_name");
        await assert.rejects(
          tx.product.create({
            data: {
              name: `  qa   MEAL ${suffix}  `,
              price: "1.00",
              categoryId: category.id,
            },
          }),
          (e) => e.code === "P2002",
        );
        await tx.$executeRawUnsafe("ROLLBACK TO SAVEPOINT duplicate_name");
        const other = await tx.product.create({
          data: {
            name: `Other ${suffix}`,
            price: "1.00",
            categoryId: category.id,
          },
        });
        await tx.$executeRawUnsafe("SAVEPOINT rename_name");
        await assert.rejects(
          tx.product.update({
            where: { id: other.id },
            data: { name: name.toUpperCase() },
          }),
          (e) => e.code === "P2002",
        );
        await tx.$executeRawUnsafe("ROLLBACK TO SAVEPOINT rename_name");
        const employee = await tx.employee.create({
          data: {
            name: "QA",
            email: `${suffix}@example.test`,
            passwordHash: "unused-test-hash",
          },
        });
        assert.equal(employee.role, "EMPLOYEE");
        assert.equal(employee.active, true);
        // Far-future dates isolate the report from existing store sales.
        const start = new Date("2098-11-14T03:00:00Z"),
          end = new Date("2098-11-16T03:00:00Z");
        const baseline = await finance.daily(start, end, tx);
        assert.equal(
          baseline.length,
          0,
          "Use an empty date window for these fixtures",
        );
        let keptOrder;
        for (const [createdAt, status, total] of [
          ["2098-11-14T02:59:59Z", "COMPLETED", "99.00"],
          ["2098-11-14T03:00:00Z", "COMPLETED", "0.10"],
          ["2098-11-16T02:59:59Z", "COMPLETED", "0.20"],
          ["2098-11-16T03:00:00Z", "COMPLETED", "99.00"],
          ["2098-11-14T12:00:00Z", "CANCELED", "99.00"],
          ["2098-11-14T12:00:00Z", "PENDING", "99.00"],
        ]) {
          keptOrder = await tx.order.create({
            data: {
              customerName: "QA rollback",
              status,
              paymentMethod: "PIX",
              total,
              createdAt: new Date(createdAt),
              orderItems: {
                create: {
                  productId: product.id,
                  quantity: 1,
                  unitPrice: total,
                },
              },
            },
          });
        }
        const rows = await finance.daily(start, end, tx);
        assert.deepEqual(
          rows.map((r) => [r.date, Number(r.count), r.total.toFixed(2)]),
          [
            ["2098-11-14", 1, "0.10"],
            ["2098-11-15", 1, "0.20"],
          ],
        );
        await tx.product.update({
          where: { id: product.id },
          data: { deletedAt: new Date(), available: false },
        });
        assert.equal(
          await tx.product.findUnique({
            where: { id: product.id, deletedAt: null },
          }),
          null,
        );
        const history = await tx.order.findUnique({
          where: { id: keptOrder.id },
          include: { orderItems: { include: { product: true } } },
        });
        assert.equal(history.orderItems[0].product.name, name);
        await tx.$executeRawUnsafe("SAVEPOINT deleted_name");
        await assert.rejects(
          tx.product.create({
            data: { name, price: "1.00", categoryId: category.id },
          }),
          (e) => e.code === "P2002",
        );
        await tx.$executeRawUnsafe("ROLLBACK TO SAVEPOINT deleted_name");
        throw rollback;
      },
      { timeout: 30000 },
    );
  } catch (error) {
    if (error !== rollback) throw error;
  }
});
