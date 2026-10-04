/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { useLayoutEffect, useRef, useState, type PointerEvent } from 'react';

import classes from './ColorPicker.module.less';

interface ColorSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onValueChange: (value: number) => void;
  background: string;
  thumbColor: string;
  ariaLabel: string;
}

function ColorSlider({
  value,
  min,
  max,
  step = 1,
  onValueChange,
  background,
  thumbColor,
  ariaLabel,
}: ColorSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Track container width as state so re-measuring on resize triggers re-render
  const [containerWidth, setContainerWidth] = useState(0);
  const dragRef = useRef<{ startX: number; startValue: number } | null>(null);

  // Measure once after mount (before paint) and on resize
  useLayoutEffect(() => {
    if (!containerRef.current) {
      return;
    }

    setContainerWidth(containerRef.current.offsetWidth);
    const ro = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Derive thumb position synchronously in render — no extra re-render cycle needed
  const thumbWidth = 10;
  const ratio = containerWidth > 0 ? (value - min) / (max - min) : 0;
  const thumbLeft = ratio * (containerWidth - thumbWidth);

  const handlePointerDown = (e: PointerEvent<SVGSVGElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startValue: value };
  };

  const handlePointerMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!dragRef.current || !containerRef.current) {
      return;
    }

    const containerW = containerRef.current.offsetWidth;
    const dx = e.clientX - dragRef.current.startX;
    const deltaValue = (dx / (containerW - thumbWidth)) * (max - min);
    const raw = dragRef.current.startValue + deltaValue;
    const stepped = Math.round(raw / step) * step;
    const clamped = Math.min(max, Math.max(min, stepped));
    onValueChange(clamped);
  };

  const handlePointerUp = (e: PointerEvent<SVGSVGElement>) => {
    dragRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div ref={containerRef} className={classes.sliderContainer}>
      <svg
        className={classes.sliderThumb}
        style={{ left: thumbLeft }}
        width="10"
        height="15"
        viewBox="0 0 10 15"
        aria-hidden="true"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <path
          d="M 0.5,0.5 L 9.5,0.5 L 9.5,9.5 L 5,14.5 L 0.5,9.5 Z"
          fill={thumbColor}
          stroke="#585858"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onValueChange(parseInt(e.target.value, 10))}
        className={classes.sliderInput}
        style={{ background }}
        aria-label={ariaLabel}
      />
    </div>
  );
}

export default ColorSlider;
