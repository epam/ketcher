import { RefObject, useLayoutEffect, useRef } from 'react';

const useTranslateAlongXAxis = (
  ref: RefObject<HTMLElement | SVGSVGElement>,
  offsetX: number,
) => {
  const animateRef = useRef<number | null>(null);

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
        animateRef.current = null;
      }
    };
  }, [ref, offsetX]);
};

export default useTranslateAlongXAxis;
