import { type RefObject, useEffect, useRef } from 'react';

/**
 * Triggers a callback when a click occurs outside of the given target element.
 *
 * @param targetRef - React ref pointing to the DOM Node to treat as the "inside" area. When the click target is contained within this node, the callback will not fire.
 * @param callback - Function to invoke on outside click.
 * @remarks
 * - The latest callback is read from a ref and synchronized via a `[callback]` sync effect to avoid re-subscribing the listener when the callback identity changes.
 * - The listener effect depends on `[targetRef]` only. `targetRef` is expected to be stable (created via `useRef`).
 */
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
