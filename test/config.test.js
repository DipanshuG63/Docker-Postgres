const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const spec = require('../openapi.json');
const pkg = require('../package.json');
test('PostgreSQL and Supabase dependencies are declared', () => {
  assert.ok(pkg.dependencies.pg);
  assert.ok(pkg.dependencies['@supabase/supabase-js']);
  assert.equal(pkg.dependencies['better-sqlite3'], undefined);
});
test('protected routes declare bearer authentication', () => {
  for (const path of ['/protected/profile', '/protected/dashboard']) assert.deepEqual(spec.paths[path].get.security, [{ bearerAuth: [] }]);
  assert.deepEqual(spec.paths['/auth/logout'].post.security, [{ bearerAuth: [] }]);
});
test('environment files are excluded from Git and Docker', () => {
  for (const file of ['.gitignore', '.dockerignore']) {
    const rules = fs.readFileSync(file, 'utf8').split(/\r?\n/);
    assert.ok(rules.includes('.env'));
    assert.ok(rules.includes('.env.*'));
    assert.ok(rules.includes('!.env.example'));
  }
});
