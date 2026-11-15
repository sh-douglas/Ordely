import assert from "node:assert/strict";
import { test, mock, afterEach } from "node:test";
process.env.DATABASE_URL = "postgresql://test:test@127.0.0.1:1/test";
process.env.JWT_SECRET = "repository_test_secret_only";
const { prisma } = await import("../src/lib/prisma.ts");
const { default: products } =
  await import("../src/repositories/product-repository.ts");
const originals = Object.fromEntries(
  ["findMany", "findUnique", "update"].map((key) => [key, prisma.product[key]]),
);
afterEach(() => {
  for (const [key, value] of Object.entries(originals))
    prisma.product[key] = value;
});
function stub(key, impl) {
  const fn = mock.fn(impl);
  prisma.product[key] = fn;
  return fn;
}
test("deleted products are excluded from menu, inventory, order lookup and edits", async () => {
  const many = stub("findMany", async () => []);
  await products.findAvailable();
  await products.findAll();
  await products.findByIds(["id"]);
  for (const call of many.mock.calls)
    assert.equal(call.arguments[0].where.deletedAt, null);
  const single = stub("findUnique", async () => null);
  await products.findById("id");
  assert.equal(single.mock.calls[0].arguments[0].where.deletedAt, null);
  const update = stub("update", async () => ({}));
  await products.update("id", { name: "Name" });
  await products.updateAvailability("id", true);
  for (const call of update.mock.calls)
    assert.equal(call.arguments[0].where.deletedAt, null);
});
test("delete archives product and disables availability without removing order relations", async () => {
  const update = stub("update", async () => ({}));
  await products.remove("id");
  const args = update.mock.calls[0].arguments[0];
  assert.deepEqual(args.where, { id: "id", deletedAt: null });
  assert.equal(args.data.available, false);
  assert.ok(args.data.deletedAt instanceof Date);
});
