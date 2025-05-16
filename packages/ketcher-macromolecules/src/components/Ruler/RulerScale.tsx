import { ZoomTransform } from 'd3';
import { memo, ReactElement, useMemo, useRef } from 'react';
import { LayoutMode } from 'ketcher-core';

import styles from './RulerArea.module.less';

type Props = {
  transform: ZoomTransform;
  layoutMode: LayoutMode;
};

const RulerScale = ({ transform, layoutMode }: Props) => {
  const ref = useRef<SVGSVGElement>(null);

  const positions = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => {
        if (layoutMode === 'sequence-layout-mode') {
          return 44 + i * 10 * 20 + (i - 1) * 10;
        } else if (layoutMode === 'snake-layout-mode') {
          return 20 + i * 60;
        }

        return 0;
      }),
    [layoutMode],
  );

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

      if (i === positions.length - 1) {
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
  }, [positions, layoutMode, transform]);

  return (
    <svg className={styles.rulerScale} ref={ref} data-testid="ruler-scale">
      {svgChildren}
    </svg>
  );
};

export default memo(RulerScale);
