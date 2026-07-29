/**
 * Returns a value for an existing key from a map.
 * Throws an error with the given message if the key is missing.
 */
export function getOrThrow<K, V>(map: Map<K, V>, key: K, message: string): V {
  if (!map.has(key)) {
    throw new Error(message);
  }
  return map.get(key) as V;
}
