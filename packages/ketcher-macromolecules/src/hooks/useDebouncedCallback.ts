import { useCallback, useEffect, useRef } from 'react';
import { debounce, DebouncedFunc } from 'lodash';

type UseDebouncedCallbackResult<T extends (...args: never[]) => unknown> = {
  debouncedCallback: (...args: Parameters<T>) => void;
  invokeImmediately: (...args: Parameters<T>) => ReturnType<T>;
  cancel: () => void;
};

export function useDebouncedCallback<T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number,
): UseDebouncedCallbackResult<T> {
  const callbackRef = useRef(callback);
  const debounceInstanceRef = useRef<DebouncedFunc<T> | undefined>(undefined);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    debounceInstanceRef.current = debounce(
      (...args: never[]) => callbackRef.current(...args),
      delay,
    ) as DebouncedFunc<T>;

    return () => {
      debounceInstanceRef.current?.cancel();
      debounceInstanceRef.current = undefined;
    };
  }, [delay]);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => debounceInstanceRef.current?.(...args),
    [],
  );
  const invokeImmediately = useCallback(
    (...args: Parameters<T>) => callbackRef.current(...args) as ReturnType<T>,
    [],
  );
  const cancel = useCallback(() => debounceInstanceRef.current?.cancel(), []);

  return { debouncedCallback, invokeImmediately, cancel };
}
