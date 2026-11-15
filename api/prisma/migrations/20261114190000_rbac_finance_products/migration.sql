BEGIN;
CREATE TYPE "EmployeeRole" AS ENUM ('ADMIN', 'EMPLOYEE');
ALTER TABLE "employees" ADD COLUMN "role" "EmployeeRole" NOT NULL DEFAULT 'EMPLOYEE', ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "products" ADD COLUMN "deletedAt" TIMESTAMP(3);
-- Abort instead of renaming or removing existing duplicate products.
CREATE UNIQUE INDEX "products_normalized_name_key" ON "products" (lower(regexp_replace(btrim("name"), '[[:space:]]+', ' ', 'g')));
CREATE INDEX "orders_status_createdAt_idx" ON "orders" ("status", "createdAt");
COMMIT;
