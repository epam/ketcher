import { ZoomTransform } from 'd3';
import { memo, ReactElement, useMemo, useRef } from 'react';
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
};

const RulerScale = ({ transform, layoutMode }: Props) => {
  const ref = useRef<SVGSVGElement>(null);
  const isZoomedOut = transform.k <= 0.5;

  const positions = useMemo(() => {
    return Array.from(
      { length: layoutMode === 'snake-layout-mode' ? 100 : 20 },
      (_, i) => {
        if (layoutMode === 'sequence-layout-mode') {
          return (
            SequenceModeStartOffset +
            i * 10 * SequenceModeItemWidth +
            (i - 1) * SequenceModeIndentWidth
          );
        } else if (layoutMode === 'snake-layout-mode') {
          return SnakeModeStartOffset + i * SnakeModeItemWidth;
        }
        return 0;
      },
    );
  }, [layoutMode]);

  const svgChildren = useMemo(() => {
    const children: ReactElement[] = [];

    positions.forEach((position, i) => {
      if (layoutMode === 'sequence-layout-mode') {
        children.push(
          <line
            key={`ruler-mark-${i}`}
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
                key={`ruler-label-${i}`}
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
                key={`ruler-mark-${i}`}
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
              key={`ruler-label-${i}`}
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

      if (i === positions.length - 1) {
        return;
      }

      // Skip dashed lines between markers when zoomed out (too many markers)
      if (isZoomedOut && layoutMode === 'snake-layout-mode') {
        return;
      }

      children.push(
        <line
          key={`ruler-fill-${i}`}
          x1={transform.applyX(position + 10)}
          y1={18}
          x2={transform.applyX(positions[i + 1] - 10)}
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
