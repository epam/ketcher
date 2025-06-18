import { RefObject, useLayoutEffect } from 'react';

const useTranslateAlongXAxis = (
  ref: RefObject<HTMLElement | SVGSVGElement>,
  offsetX: number,
) => {
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    element.style.transform = `translateX(${offsetX}px)`;
  }, [ref, offsetX]);
};

export default useTranslateAlongXAxis;
