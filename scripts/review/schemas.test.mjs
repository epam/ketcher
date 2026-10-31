import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  FINDINGS_SCHEMA,
  ID_PATTERN,
  LINKED_ISSUE_SCHEMA,
  LOCATION_PATTERN,
  SEVERITIES,
  VERDICT_SCHEMA,
} from './schemas.mjs';

const SCHEMAS = { FINDINGS_SCHEMA, VERDICT_SCHEMA, LINKED_ISSUE_SCHEMA };

/** Every object schema inside `schema`, the schema itself included. */
function objectSchemas(schema) {
  const found = [];
  const visit = (node) => {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'object') found.push(node);
    for (const value of Object.values(node)) visit(value);
  };
  visit(schema);
  return found;
}

test('every object requires all its properties and allows no others', () => {
  for (const [name, schema] of Object.entries(SCHEMAS)) {
    for (const object of objectSchemas(schema)) {
      assert.equal(object.additionalProperties, false, name);
      assert.deepEqual(
        [...object.required].sort(),
        Object.keys(object.properties).sort(),
        name,
      );
    }
  }
});

test('schemas survive JSON serialization unchanged', () => {
  for (const schema of Object.values(SCHEMAS)) {
    assert.deepEqual(JSON.parse(JSON.stringify(schema)), schema);
  }
});

test('severities are the levels of the output contract', () => {
  assert.deepEqual(SEVERITIES, ['blocker', 'major', 'nit']);
});

test('the ID pattern takes rules, invariants and none', () => {
  const id = new RegExp(ID_PATTERN);
  for (const good of ['R5', 'R17', 'D1', 'A7', 'B3', 'none']) {
    assert.ok(id.test(good), good);
  }
  for (const bad of ['', 'R', 'R-005', 'r5', 'None', 'R5 ', 'A1, A2']) {
    assert.ok(!id.test(bad), bad);
  }
});

test('the location pattern takes file:line only', () => {
  const location = new RegExp(LOCATION_PATTERN);
  for (const good of ['packages/a/src/b.ts:12', 'README.md:1']) {
    assert.ok(location.test(good), good);
  }
  for (const bad of ['b.ts', 'b.ts:0', 'b.ts:12-14', 'my file.ts:3', 'b.ts:']) {
    assert.ok(!location.test(bad), bad);
  }
});