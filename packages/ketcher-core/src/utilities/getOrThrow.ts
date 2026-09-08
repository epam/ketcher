type MapLike<K, V> = {
  has(key: K): boolean;
  get(key: K): V | undefined;
};

export function getOrThrow<K, V>(
  map: MapLike<K, V>,
  key: K,
  message: string,
): V {
  if (!map.has(key)) {
    throw new Error(message);
  }
  return map.get(key) as V;
}
