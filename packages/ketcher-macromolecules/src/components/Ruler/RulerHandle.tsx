import { memo, useEffect, useRef } from 'react';
import { D3DragEvent, drag, select } from 'd3';

import useTranslateAlongXAxis from './useTranslateAlongXAxis';

import styles from './RulerArea.module.less';

type Props = {
  offsetX: number;
  onDragStart: (event: D3DragEvent<SVGGElement, unknown, unknown>) => void;
  onDrag: (event: D3DragEvent<SVGGElement, unknown, unknown>) => void;
  onDragEnd: (event: D3DragEvent<SVGGElement, unknown, unknown>) => void;
};

const RulerHandle = ({ offsetX, onDragStart, onDrag, onDragEnd }: Props) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const handleRef = useRef<SVGGElement>(null);

  useTranslateAlongXAxis(svgRef, offsetX);

  useEffect(() => {
    if (!handleRef.current) {
      return;
    }

    const handle = select(handleRef.current);

    const dragBehavior = drag<SVGGElement, unknown>()
      .on('start', onDragStart)
      .on('drag', onDrag)
      .on('end', onDragEnd);

    handle.call(dragBehavior);

    return () => {
      handle.on('.drag', null);
    };
  }, [onDrag, onDragEnd, onDragStart]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={styles.rulerHandle}
      viewBox="0 0 16 13"
      fill="none"
      pointerEvents="none"
      ref={svgRef}
      data-testid="ruler-handle"
    >
      <g cursor="pointer" pointerEvents="all" ref={handleRef}>
        <mask id="ruler-handle-mask" fill="#fff">
          <path
            fillRule="evenodd"
            d="M16 1.625a1 1 0 0 0-1-1H1a1 1 0 0 0-1 1v4.5a1 1 0 0 0 .4.8l7 5.25a1 1 0 0 0 1.2 0l7-5.25a1 1 0 0 0 .4-.8v-4.5Z"
            clipRule="evenodd"
          />
        </mask>
        <path
          fill="#CAD3DD"
          fillRule="evenodd"
          d="M16 1.625a1 1 0 0 0-1-1H1a1 1 0 0 0-1 1v4.5a1 1 0 0 0 .4.8l7 5.25a1 1 0 0 0 1.2 0l7-5.25a1 1 0 0 0 .4-.8v-4.5Z"
          clipRule="evenodd"
        />
        <path
          fill="#B4B9D6"
          d="m15.6 6.925-.6-.8.6.8Zm-8.2 5.25.6-.8-.6.8Zm-7-5.25.6-.8-.6.8Zm.6-5.3h14v-2H1v2Zm0 4.5v-4.5h-2v4.5h2Zm7 5.25-7-5.25-1.2 1.6 7 5.25 1.2-1.6Zm7-5.25-7 5.25 1.2 1.6 7-5.25-1.2-1.6Zm0-4.5v4.5h2v-4.5h-2Zm1.2 6.1a2 2 0 0 0 .8-1.6h-2l1.2 1.6Zm-9.4 5.25a2 2 0 0 0 2.4 0l-1.2-1.6-1.2 1.6ZM-1 6.125a2 2 0 0 0 .8 1.6l1.2-1.6h-2Zm16-4.5h2a2 2 0 0 0-2-2v2Zm-14-2a2 2 0 0 0-2 2h2v-2Z"
          mask="url(#ruler-handle-mask)"
        />
      </g>
    </svg>
  );
};

export default memo(RulerHandle);
