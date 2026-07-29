export function getOrThrow<K, V>(map: Map<K, V>, key: K, message: string): V {
  if (!map.has(key)) {
    throw new Error(message);
  }
  return map.get(key) as V;
}
