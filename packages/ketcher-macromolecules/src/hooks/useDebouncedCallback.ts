import { useMemo } from 'react';
import { debounce, DebouncedFunc } from 'lodash';

export function useDebouncedCallback<T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number,
): DebouncedFunc<T> {
  return useMemo(() => debounce(callback, delay), [callback, delay]);
}
