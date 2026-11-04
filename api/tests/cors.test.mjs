import assert from 'node:assert/strict';
import { test } from 'node:test';
import { allowedOrigins } from '../src/config/cors.ts';

test('localhost allows only the corresponding IPv4 loopback origin', () => {
  assert.deepEqual([...allowedOrigins('http://localhost:5173')], ['http://localhost:5173', 'http://127.0.0.1:5173']);
});
test('IPv4 loopback also allows localhost', () => {
  assert.deepEqual([...allowedOrigins('http://127.0.0.1:5173')], ['http://127.0.0.1:5173', 'http://localhost:5173']);
});
test('external origins do not acquire loopback aliases', () => {
  assert.deepEqual([...allowedOrigins('https://ordely.example')], ['https://ordely.example']);
});
test('local aliases do not allow other ports, protocols or similar hostnames', () => {
  const origins = allowedOrigins('http://localhost:5173');
  for (const origin of ['http://127.0.0.1:5174', 'https://127.0.0.1:5173', 'http://localhost.evil.example:5173', 'http://127.0.0.2:5173', 'null']) assert.equal(origins.has(origin), false);
});
