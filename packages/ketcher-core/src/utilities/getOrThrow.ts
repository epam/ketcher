import assert from 'assert';

export function getOrThrow<K, V>(map: Map<K, V>, key: K, message: string): V {
  const value = map.get(key);
  assert(value !== undefined, message);
  return value;
}
