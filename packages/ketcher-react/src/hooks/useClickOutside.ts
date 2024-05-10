import { useEffect, RefObject } from 'react';

export const useClickOutside = (
  targetRef: RefObject<Node>,
  callback: () => void,
): void => {
  const onClickOutside = (e: Event) => {
    if (!targetRef.current?.contains(e.target as Node)) {
      callback();
    }
  };

  useEffect(() => {
    document.addEventListener('click', onClickOutside);
    return () => {
      document.removeEventListener('click', onClickOutside);
    };
  }, []);
};
