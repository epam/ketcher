import { range, select, ZoomTransform } from 'd3';
import { memo, useLayoutEffect, useRef } from 'react';

import styles from './RulerArea.module.less';

type Props = {
  transform: ZoomTransform;
};

const RulerScale = ({ transform }: Props) => {
  const ref = useRef<SVGSVGElement>(null);

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    const svg = select(ref.current);

    svg.selectAll('*').remove();

    const positions = range(0, 10).map((i) => {
      return 44 + i * 10 * 20 + (i - 1) * 10;
    });

    positions.forEach((position, i) => {
      svg
        .append('line')
        .attr('x1', `${transform.applyX(position)}`)
        .attr('y1', 14)
        .attr('x2', `${transform.applyX(position)}`)
        .attr('y2', 22)
        .attr('stroke', '#7C7C7F')
        .attr('stroke-width', 1);

      if (i === positions.length - 1) {
        return;
      }

      svg
        .append('line')
        .attr('x1', `${transform.applyX(position + 5)}`)
        .attr('y1', 18)
        .attr('x2', `${transform.applyX(positions[i + 1] + -5)}`)
        .attr('y2', 18)
        .attr('stroke', '#B4B9D6')
        .attr('stroke-dasharray', '2,2')
        .attr('stroke-width', 1);
    });
  }, [transform]);

  return (
    <svg className={styles.rulerScale} ref={ref} data-testid="ruler-scale" />
  );
};

export default memo(RulerScale);
