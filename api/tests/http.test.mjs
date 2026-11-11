import assert from 'node:assert/strict';
import { after, afterEach, before, beforeEach, mock, test } from 'node:test';
import { once } from 'node:events';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Never use the developer's database or JWT secret in this suite.
process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test';
process.env.JWT_SECRET = 'http_regression_test_secret_only';
process.env.JWT_EXPIRES_IN = '1h';
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.PORT = '5000';

const { default: app } = await import('../src/app.ts');
const { default: employees } = await import('../src/repositories/employee-repository.ts');
const { default: categories } = await import('../src/repositories/category-repository.ts');
const { default: products } = await import('../src/repositories/product-repository.ts');
const { default: orders } = await import('../src/repositories/order-repository.ts');
const { Prisma } = await import('../src/generated/prisma/client.ts');
const employeeId = 'a011a0d5-1ac1-4df0-a1d0-000000000001';
const productId = 'a011a0d5-1ac1-4df0-a1d0-000000000002';
const categoryId = 'a011a0d5-1ac1-4df0-a1d0-000000000003';
const trackingCode = 'a011a0d5-1ac1-4df0-a1d0-000000000004';
const employee = { id: employeeId, name: 'Employee', email: 'test@example.com', passwordHash: await bcrypt.hash('test-password', 4) };
const category = { id: categoryId, name: 'Meals' };
const product = { id: productId, name: 'Meal', price: new Prisma.Decimal('12.50'), available: true, categoryId };
const order = { id: 1, status: 'PENDING', trackingCode, orderItems: [{ product, quantity: 1, unitPrice: product.price }] };
const token = jwt.sign({ sub: employeeId }, process.env.JWT_SECRET);
const orderBody = { customerName: 'Customer', customerPhone: '11999999999', paymentMethod: 'PIX', items: [{ productId, quantity: 1 }] };
let server;
let base;

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
});
beforeEach(() => {
  const fixtures = [
    [employees, { findAll: [employee], findById: employee, findByEmail: employee, create: employee }],
    [categories, { findById: category, findByName: null, findAll: [category], create: category, update: category }],
    [products, { findById: product, findByIds: [product], findAvailable: [product], findAll: [product], create: product, update: product, updateAvailability: { ...product, available: false } }],
    [orders, { findById: order, findByTrackingCode: order, findActive: [order], findHistory: [], create: order, updateStatus: { ...order, status: 'IN_PROGRESS' } }],
  ];
  for (const [repository, methods] of fixtures) {
    // Every repository method must be stubbed to prevent accidental database access.
    for (const name of Object.getOwnPropertyNames(Object.getPrototypeOf(repository))) {
      if (name === 'constructor') continue;
      assert.ok(Object.hasOwn(methods, name), `Missing stub: ${name}`);
      mock.method(repository, name, async () => methods[name]);
    }
  }
});
afterEach(() => mock.restoreAll());

async function request(path, { method = 'GET', body, raw, auth = false, headers = {} } = {}) {
  const response = await fetch(base + path, {
    method,
    headers: { ...(body !== undefined || raw !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(auth ? { Authorization: `Bearer ${token}` } : {}), ...headers },
    ...(body !== undefined ? { body: JSON.stringify(body) } : raw !== undefined ? { body: raw } : {}),
  });
  return { status: response.status, body: await response.json() };
}
async function expectError(path, options, status, message) {
  const result = await request(path, options);
  assert.equal(result.status, status);
  assert.deepEqual(result.body, { error: message });
}

for (const [path, options, expected] of [
  ['/health', {}, 200],
  ['/categories', {}, 200],
  ['/categories', { method: 'POST', auth: true, body: { name: 'Meals' } }, 201],
  ['/products/menu', {}, 200],
  ['/products/inventory', { auth: true }, 200],
  ['/products', { method: 'POST', auth: true, body: { name: 'Meal', price: '12.50', categoryId } }, 201],
  [`/products/${productId}/availability`, { method: 'PATCH', auth: true, body: { available: false } }, 200],
  ['/orders', { method: 'POST', body: orderBody }, 201],
  ['/orders', { auth: true }, 200],
  ['/orders/history', { auth: true }, 200],
  ['/orders/1', { auth: true }, 200],
  [`/orders/track/${trackingCode}`, {}, 200],
  ['/orders/1/status', { method: 'PATCH', auth: true, body: { status: 'IN_PROGRESS' } }, 200],
  ['/auth/signin', { method: 'POST', body: { email: employee.email, password: 'test-password' } }, 200],
  ['/auth/signup', { method: 'POST', auth: true, body: { name: 'Employee', email: 'new@example.com', password: 'test-password', confirmPassword: 'test-password' } }, 201],
  ['/auth/me', { auth: true }, 200],
]) {
  test(`${options.method ?? 'GET'} ${path} returns ${expected}`, async () => {
    if (path === '/auth/signup') employees.findByEmail.mock.mockImplementation(async () => null);
    assert.equal((await request(path, options)).status, expected);
  });
}

for (const [method, path] of [
  ['GET', '/auth/employees'], ['PATCH', `/products/${productId}`], ['PATCH', `/categories/${categoryId}`], ['POST', '/auth/signup'], ['GET', '/auth/me'], ['POST', '/categories'],
  ['POST', '/products'], ['GET', '/products/inventory'], ['PATCH', `/products/${productId}/availability`],
  ['GET', '/orders'], ['GET', '/orders/history'], ['GET', '/orders/1'], ['PATCH', '/orders/1/status'],
]) {
  test(`${method} ${path} requires authentication`, () => expectError(path, { method }, 401, 'Unauthorized.'));
}

test('missing orders return 404 for ID and tracking code', async () => {
  orders.findById.mock.mockImplementation(async () => null);
  orders.findByTrackingCode.mock.mockImplementation(async () => null);
  await expectError('/orders/1', { auth: true }, 404, 'Order not found.');
  await expectError('/orders/1/status', { method: 'PATCH', auth: true, body: { status: 'READY' } }, 404, 'Order not found.');
  await expectError(`/orders/track/${trackingCode}`, {}, 404, 'Order not found.');
});
test('invalid integer IDs return 400 before querying the repository', async () => {
  for (const id of ['abc', '0', '-1', '1.5', '1e2', '0x10', '2147483648']) {
    for (const suffix of ['', '/status']) {
      await expectError(`/orders/${id}${suffix}`, { auth: true, ...(suffix ? { method: 'PATCH', body: { status: 'READY' } } : {}) }, 400, 'Order ID must be an integer between 1 and 2147483647.');
    }
  }
  assert.equal(orders.findById.mock.callCount(), 0);
});
test('invalid UUIDs return 400 before querying repositories', async () => {
  await expectError('/products/invalid/availability', { method: 'PATCH', auth: true, body: { available: true } }, 400, 'Product ID must be a valid UUID.');
  await expectError('/orders/track/invalid', {}, 400, 'Tracking code must be a valid UUID.');
  assert.equal(products.findById.mock.callCount(), 0);
  assert.equal(orders.findByTrackingCode.mock.callCount(), 0);
});
test('invalid JSON returns 400', () => expectError('/orders', { method: 'POST', raw: '{broken' }, 400, 'Request body must be valid JSON.'));
test('oversized JSON returns 413', () => expectError('/orders', { method: 'POST', body: { data: 'x'.repeat(110000) } }, 413, 'Request body is too large.'));
test('unsupported charset returns 415', () => expectError('/orders', { method: 'POST', raw: '{}', headers: { 'Content-Type': 'application/json; charset=invalid' } }, 415, 'Request charset is not supported.'));
test('unsupported encoding returns 415', () => expectError('/orders', { method: 'POST', raw: '{}', headers: { 'Content-Encoding': 'invalid' } }, 415, 'Request encoding is not supported.'));
test('CORS denial returns 403', () => expectError('/health', { headers: { Origin: 'http://forbidden.example' } }, 403, 'Origin is not allowed.'));
test('unknown route returns 404', () => expectError('/unknown', {}, 404, 'Route not found.'));
test('phone validation explains the required length', () => expectError('/orders', { method: 'POST', body: { ...orderBody, customerPhone: '123' } }, 400, 'The customer phone field must contain exactly 11 digits.'));
test('invalid order status transitions return 409', () => expectError('/orders/1/status', { method: 'PATCH', auth: true, body: { status: 'COMPLETED' } }, 409, 'Invalid order status transition.'));
test('unavailable products return 409', async () => {
  products.findByIds.mock.mockImplementation(async () => [{ ...product, available: false }]);
  await expectError('/orders', { method: 'POST', body: orderBody }, 409, 'One or more products are unavailable.');
});
test('missing products and categories return 404', async () => {
  products.findByIds.mock.mockImplementation(async () => []);
  products.findById.mock.mockImplementation(async () => null);
  categories.findById.mock.mockImplementation(async () => null);
  await expectError('/orders', { method: 'POST', body: orderBody }, 404, 'One or more products were not found.');
  await expectError(`/products/${productId}/availability`, { method: 'PATCH', auth: true, body: { available: true } }, 404, 'Product not found.');
  await expectError('/products', { method: 'POST', auth: true, body: { name: 'Meal', price: '12.50', categoryId } }, 404, 'Category not found.');
});
test('duplicate categories and emails return 409', async () => {
  categories.findByName.mock.mockImplementation(async () => category);
  await expectError('/categories', { method: 'POST', auth: true, body: { name: 'Meals' } }, 409, 'This category already exists.');
  await expectError('/auth/signup', { method: 'POST', auth: true, body: { name: 'Employee', email: employee.email, password: 'test-password', confirmPassword: 'test-password' } }, 409, 'Email already in use.');
});
test('bad credentials return 401', async () => {
  await expectError('/auth/signin', { method: 'POST', body: { email: employee.email, password: 'wrong-password' } }, 401, 'Invalid credentials.');
  employees.findByEmail.mock.mockImplementation(async () => null);
  await expectError('/auth/signin', { method: 'POST', body: { email: employee.email, password: 'test-password' } }, 401, 'Invalid credentials.');
});
test('malformed authorization headers and JWT subjects never reach the database', async () => {
  for (const authorization of [`Bearer ${token} extra`, 'Basic credentials']) {
    await expectError('/auth/me', { headers: { Authorization: authorization } }, 401, 'Unauthorized.');
  }
  for (const invalidToken of ['invalid', jwt.sign({ sub: 'not-a-uuid' }, process.env.JWT_SECRET), jwt.sign({}, process.env.JWT_SECRET), jwt.sign({ sub: employeeId }, process.env.JWT_SECRET, { expiresIn: -1 })]) {
    await expectError('/auth/me', { headers: { Authorization: `Bearer ${invalidToken}` } }, 401, 'Invalid or expired token.');
  }
  assert.equal(employees.findById.mock.callCount(), 0);
});
test('Bearer scheme is case insensitive', async () => {
  assert.equal((await request('/auth/me', { headers: { Authorization: `bearer ${token}` } })).status, 200);
});
for (const [code, status, message] of [
  ['P2002', 409, 'A record with these unique fields already exists.'],
  ['P2003', 409, 'The operation conflicts with a related record.'],
  ['P2025', 404, 'Record not found.'],
]) {
  test(`database ${code} returns ${status}`, async () => {
    categories.create.mock.mockImplementation(async () => { throw new Prisma.PrismaClientKnownRequestError('private database details', { code, clientVersion: '7.10.1' }); });
    await expectError('/categories', { method: 'POST', auth: true, body: { name: 'Meals' } }, status, message);
  });
}
test('unexpected failures remain 500 without exposing details', async () => {
  mock.method(console, 'error', () => {});
  categories.findAll.mock.mockImplementation(async () => { throw new Error('private database details'); });
  await expectError('/categories', {}, 500, 'An error occurred with your request. Please try again later.');
});

test('validation rejects invalid payloads on each write endpoint with 400', async () => {
  for (const [path, method, body, auth] of [
    ['/auth/signin', 'POST', { email: 'invalid', password: 'secret' }, false],
    ['/auth/signup', 'POST', { name: 'Employee', email: employee.email, password: 'secret', confirmPassword: 'different' }, true],
    ['/categories', 'POST', { name: 'x' }, true],
    ['/products', 'POST', { name: 'Meal', price: '-1', categoryId }, true],
    [`/products/${productId}/availability`, 'PATCH', { available: 'true' }, true],
    ['/orders', 'POST', { ...orderBody, items: [] }, false],
    ['/orders/1/status', 'PATCH', { status: 'INVALID' }, true],
  ]) {
    const result = await request(path, { method, body, auth });
    assert.equal(result.status, 400, `${method} ${path}`);
    assert.equal(typeof result.body.error, 'string');
  }
});
test('tokens belonging to removed employees return 401', async () => {
  employees.findById.mock.mockImplementation(async () => null);
  await expectError('/auth/me', { auth: true }, 401, 'Invalid or expired token.');
});
test('missing tables remain a server error, not a missing API resource', async () => {
  mock.method(console, 'error', () => {});
  products.findAvailable.mock.mockImplementation(async () => { throw new Prisma.PrismaClientKnownRequestError('table missing', { code: 'P2021', clientVersion: '7.10.1' }); });
  await expectError('/products/menu', {}, 500, 'An error occurred with your request. Please try again later.');
});

test('CORS returns the matching origin for localhost and its loopback alias', async () => {
  for (const origin of ['http://localhost:5173', 'http://127.0.0.1:5173']) {
    const result = await fetch(base + '/health', { headers: { Origin: origin } });
    assert.equal(result.status, 200);
    assert.equal(result.headers.get('access-control-allow-origin'), origin);
  }
});
test('CORS accepts the login preflight from the loopback alias', async () => {
  const result = await fetch(base + '/auth/signin', { method: 'OPTIONS', headers: { Origin: 'http://127.0.0.1:5173', 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type' } });
  assert.equal(result.status, 204);
  assert.equal(result.headers.get('access-control-allow-origin'), 'http://127.0.0.1:5173');
  assert.match(result.headers.get('access-control-allow-methods'), /POST/);
  assert.match(result.headers.get('access-control-allow-headers'), /content-type/i);
});
test('CORS still blocks a loopback origin on another port', () => expectError('/health', { headers: { Origin: 'http://127.0.0.1:5174' } }, 403, 'Origin is not allowed.'));

test('employee list exposes only public fields', async () => {
  const result = await request('/auth/employees', { auth: true });
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, [{ id: employeeId, name: employee.name, email: employee.email }]);
});
test('product edits persist price and clear optional fields', async () => {
  const body = { price: '25.90', description: null, imageUrl: null, categoryId };
  assert.equal((await request(`/products/${productId}`, { method: 'PATCH', auth: true, body })).status, 200);
  assert.deepEqual(products.update.mock.calls[0].arguments, [productId, body]);
  for (const price of ['-1', '0', '1.234']) {
    assert.equal((await request(`/products/${productId}`, { method: 'PATCH', auth: true, body: { price } })).status, 400);
  }
  categories.findById.mock.mockImplementation(async () => null);
  await expectError(`/products/${productId}`, { method: 'PATCH', auth: true, body }, 404, 'Category not found.');
  products.findById.mock.mockImplementation(async () => null);
  await expectError(`/products/${productId}`, { method: 'PATCH', auth: true, body }, 404, 'Product not found.');
});
test('category edits allow same name but reject duplicates and missing categories', async () => {
  categories.findByName.mock.mockImplementation(async () => category);
  assert.equal((await request(`/categories/${categoryId}`, { method: 'PATCH', auth: true, body: { name: 'Meals' } })).status, 200);
  assert.deepEqual(categories.update.mock.calls[0].arguments, [categoryId, 'Meals']);
  categories.findByName.mock.mockImplementation(async () => ({ ...category, id: productId }));
  await expectError(`/categories/${categoryId}`, { method: 'PATCH', auth: true, body: { name: 'Meals' } }, 409, 'This category already exists.');
  categories.findById.mock.mockImplementation(async () => null);
  await expectError(`/categories/${categoryId}`, { method: 'PATCH', auth: true, body: { name: 'Meals' } }, 404, 'Category not found.');
});
