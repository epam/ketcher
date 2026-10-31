import { useCallback, useEffect, useRef } from 'react';
import { debounce, DebouncedFunc } from 'lodash';

type UseDebouncedCallbackResult<T extends (...arguments_: never[]) => unknown> =
  {
    debouncedCallback: (...arguments_: Parameters<T>) => void;
    invokeImmediately: (...arguments_: Parameters<T>) => ReturnType<T>;
    cancel: () => void;
  };

export function useDebouncedCallback<
  T extends (...arguments_: never[]) => unknown,
>(callback: T, delay: number): UseDebouncedCallbackResult<T> {
  const callbackReference = useRef(callback);
  const debounceInstanceReference = useRef<DebouncedFunc<T> | undefined>(
    undefined,
  );

  useEffect(() => {
    callbackReference.current = callback;
  }, [callback]);

  useEffect(() => {
    debounceInstanceReference.current = debounce(
      (...arguments_: never[]) => callbackReference.current(...arguments_),
      delay,
    ) as DebouncedFunc<T>;

    return () => {
      debounceInstanceReference.current?.cancel();
      debounceInstanceReference.current = undefined;
    };
  }, [delay]);

  const debouncedCallback = useCallback(
    (...arguments_: Parameters<T>) =>
      debounceInstanceReference.current?.(...arguments_),
    [],
  );
  const invokeImmediately = useCallback(
    (...arguments_: Parameters<T>) =>
      callbackReference.current(...arguments_) as ReturnType<T>,
    [],
  );
  const cancel = useCallback(
    () => debounceInstanceReference.current?.cancel(),
    [],
  );

  return { debouncedCallback, invokeImmediately, cancel };
}
