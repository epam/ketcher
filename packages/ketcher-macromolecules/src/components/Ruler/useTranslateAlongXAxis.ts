import { RefObject, useLayoutEffect, useRef } from 'react';

const useTranslateAlongXAxis = <T extends HTMLElement | SVGSVGElement>(
  ref: RefObject<T | null>,
  offsetX: number,
) => {
  const animateRef = useRef<number | undefined>(undefined);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    animateRef.current = requestAnimationFrame(() => {
      element.style.transform = `translateX(${offsetX}px)`;
    });

    return () => {
      if (animateRef.current) {
        cancelAnimationFrame(animateRef.current);
        animateRef.current = undefined;
      }
    };
  }, [ref, offsetX]);
};

export default useTranslateAlongXAxis;
