import { useEffect, useMemo } from 'react';
import { debounce, DebouncedFunc } from 'lodash';

export function useDebouncedCallback<T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number,
): DebouncedFunc<T> {
  const debouncedCallback = useMemo(
    () => debounce(callback, delay),
    [callback, delay],
  );

  useEffect(
    () => () => {
      debouncedCallback.cancel();
    },
    [debouncedCallback],
  );

  return debouncedCallback;
}
