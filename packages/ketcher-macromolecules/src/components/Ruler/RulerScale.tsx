import { ZoomTransform } from 'd3';
import { memo, useMemo, useRef } from 'react';
import { LayoutMode } from 'ketcher-core';

import styles from './RulerArea.module.less';
import {
  SequenceModeIndentWidth,
  SequenceModeItemWidth,
  SequenceModeStartOffset,
  SnakeModeItemWidth,
  SnakeModeStartOffset,
} from 'components/Ruler/RulerArea.constants';

type Props = {
  transform: ZoomTransform;
  layoutMode: LayoutMode;
  lineLengthValue: number;
};

const RulerScale = ({
  transform,
  layoutMode,
  lineLengthValue: _lineLengthValue,
}: Props) => {
  const ref = useRef<SVGSVGElement>(null);
  const isZoomedOut = transform.k - 0.5 < Number.EPSILON;

  const getDynamicPositions = (
    visibleStart: number,
    visibleEnd: number,
    step: number,
    offset: number,
  ): number[] => {
    const startIndex = Math.max(0, Math.floor((visibleStart - offset) / step));
    const endIndex = Math.ceil((visibleEnd - offset) / step) + 10;

    return Array.from(
      { length: endIndex - startIndex },
      (_, i) => offset + (startIndex + i) * step,
    );
  };

  const positions = useMemo(() => {
    const canvasWidth =
      ref.current?.ownerSVGElement?.width.baseVal.value || 1000;
    const visibleStart = transform.invertX(0);
    const visibleEnd = transform.invertX(canvasWidth);

    if (layoutMode === 'sequence-layout-mode') {
      const step = 10 * SequenceModeItemWidth + SequenceModeIndentWidth;
      return getDynamicPositions(
        visibleStart,
        visibleEnd,
        step,
        SequenceModeStartOffset,
      );
    }

    if (layoutMode === 'snake-layout-mode') {
      return getDynamicPositions(
        visibleStart,
        visibleEnd,
        SnakeModeItemWidth,
        SnakeModeStartOffset,
      );
    }

    return [];
  }, [layoutMode, transform]);

  const svgChildren = useMemo(() => {
    const children: JSX.Element[] = [];

    positions.forEach((position, i) => {
      if (layoutMode === 'sequence-layout-mode') {
        children.push(
          <line
            key={`ruler-mark-${position}`}
            x1={transform.applyX(position)}
            y1={14}
            x2={transform.applyX(position)}
            y2={22}
            stroke="#7C7C7F"
            strokeWidth={1}
          />,
        );
      } else if (layoutMode === 'snake-layout-mode') {
        if (isZoomedOut) {
          const isMultipleOfFive = i % 5 === 0;
          if (isMultipleOfFive) {
            children.push(
              <text
                key={`ruler-label-${position}`}
                x={transform.applyX(position)}
                y={18}
                fontSize={10}
                fontWeight={500}
                fill="#7C7C7F"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {i}
              </text>,
            );
          } else {
            children.push(
              <line
                key={`ruler-mark-${position}`}
                x1={transform.applyX(position)}
                y1={14}
                x2={transform.applyX(position)}
                y2={22}
                stroke="#7C7C7F"
                strokeWidth={1}
              />,
            );
          }
        } else {
          children.push(
            <text
              key={`ruler-label-${position}`}
              x={transform.applyX(position)}
              y={18}
              fontSize={10}
              fontWeight={500}
              fill="#7C7C7F"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {i}
            </text>,
          );
        }
      }

      const nextPosition = positions[i + 1];
      if (nextPosition === undefined) {
        return;
      }

      // Skip dashed lines between markers when zoomed out (too many markers)
      if (isZoomedOut && layoutMode === 'snake-layout-mode') {
        return;
      }

      children.push(
        <line
          key={`ruler-fill-${position}-${nextPosition}`}
          x1={transform.applyX(position + 10)}
          y1={18}
          x2={transform.applyX(nextPosition - 10)}
          y2={18}
          stroke="#B4B9D6"
          strokeDasharray="2,2"
          strokeWidth={1}
        />,
      );
    });

    return children;
  }, [positions, layoutMode, transform, isZoomedOut]);

  return (
    <svg className={styles.rulerScale} ref={ref} data-testid="ruler-scale">
      {svgChildren}
    </svg>
  );
};

export default memo(RulerScale);
