import { type RefObject, useEffect, useRef } from 'react';

export const useClickOutside = (
  targetRef: RefObject<Node | null>,
  callback: () => void,
): void => {
  const callbackRef = useRef(callback);

  // Keep the latest callback to avoid re-subscribing when only callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    // SSR guard: skip attaching listeners when document is not available
    if (typeof document === 'undefined') return;

    const onClickOutside = (e: Event) => {
      if (targetRef.current?.contains(e.target as Node)) return;
      callbackRef.current();
    };

    document.addEventListener('click', onClickOutside);
    return () => {
      document.removeEventListener('click', onClickOutside);
    };
  }, [targetRef]); // targetRef expected to be stable (from useRef)
};
