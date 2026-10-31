import { RefObject, useLayoutEffect, useRef } from 'react';

const useTranslateAlongXAxis = <T extends HTMLElement | SVGSVGElement>(
  reference: RefObject<T | null>,
  offsetX: number,
) => {
  const animateReference = useRef<number | null>(null);

  useLayoutEffect(() => {
    const element = reference.current;
    if (!element) {
      return;
    }

    animateReference.current = requestAnimationFrame(() => {
      element.style.transform = `translateX(${offsetX}px)`;
    });

    return () => {
      if (animateReference.current) {
        cancelAnimationFrame(animateReference.current);
        animateReference.current = null;
      }
    };
  }, [reference, offsetX]);
};

export default useTranslateAlongXAxis;
