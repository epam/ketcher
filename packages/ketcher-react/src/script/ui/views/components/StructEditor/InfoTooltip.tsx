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

import { useState, useEffect, FC } from 'react';
import { Render } from 'ketcher-core';

import classes from './InfoPanel.module.less';
import { connect } from 'react-redux';
import clsx from 'clsx';
import { TOOLTIP_DELAY } from 'src/script/editor/utils/functionalGroupsTooltip';
import { debounce } from 'lodash';

const HOVER_PANEL_PADDING = 20;
const tooltipOffset = {
  x: 30,
  y: 30,
};

interface CursorPosition {
  x: number;
  y: number;
}

interface InfoPanelProps {
  render: Render;
  className?: string;
}

function getPanelPosition(
  position: CursorPosition,
  render: Render,
  canvasOffset: { x: number; y: number },
): CursorPosition {
  const width = 140;
  const height = 40;

  // Convert viewport coordinates to canvas-relative coordinates
  const canvasRelativeX = position.x - canvasOffset.x;
  const canvasRelativeY = position.y - canvasOffset.y;

  // adjust position to keep inside canvas area
  const viewportRightLimit = render?.clientArea?.clientWidth - width / 2;
  const viewportBottomLimit = render?.clientArea?.clientHeight - height;

  let adjustedX = canvasRelativeX - tooltipOffset.x;
  let adjustedY = canvasRelativeY - tooltipOffset.y;

  if (adjustedX > viewportRightLimit) {
    adjustedX = adjustedX - width - HOVER_PANEL_PADDING;
  }

  if (adjustedY > viewportBottomLimit) {
    adjustedY -= HOVER_PANEL_PADDING;
  }

  // Return canvas-relative coordinates
  return { x: adjustedX, y: adjustedY };
}

const InfoTooltip: FC<InfoPanelProps> = (props) => {
  const { render, className } = props;
  const [tooltip, setTooltip] = useState<null | string>(null);
  const [position, setPosition] = useState<
    CursorPosition | { x: null; y: null }
  >({
    x: null,
    y: null,
  });

  useEffect(() => {
    const debouncedShowTooltip = debounce(
      (event: MouseEvent, tooltip: string) => {
        setTooltip(tooltip);
        setPosition({
          x: event.clientX,
          y: event.clientY,
        });
      },
      TOOLTIP_DELAY,
    );
    const hideTooltip = () => {
      setTooltip(null);
      setPosition({
        x: null,
        y: null,
      });
    };

    const toggleTooltip = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const tooltip = target.dataset.tooltip;

      if (tooltip) {
        debouncedShowTooltip(event, tooltip);
      } else {
        debouncedShowTooltip.cancel();
        hideTooltip();
      }
    };

    document.addEventListener('mouseover', toggleTooltip);
    return () => {
      document.removeEventListener('mouseover', toggleTooltip);
    };
  }, []);

  if (!tooltip || !position.x || !position.y) {
    return null;
  }

  // Get canvas offset from viewport
  const canvasRect = render?.clientArea?.getBoundingClientRect();
  const canvasOffset = canvasRect
    ? { x: canvasRect.left, y: canvasRect.top }
    : { x: 0, y: 0 };

  const shiftedPosition = getPanelPosition(position, render, canvasOffset);
  const isSmall = ["5'", "3'"].includes((tooltip || '').trim());

  return (
    <div
      id="atomInfoTooltip"
      role="tooltip"
      style={{
        left: shiftedPosition.x + 'px',
        top: shiftedPosition.y + 'px',
      }}
      className={clsx(
        classes.infoTooltip,
        isSmall && classes.infoTooltipSmallSquare,
        className,
      )}
      dangerouslySetInnerHTML={{ __html: tooltip }}
    />
  );
};

export default connect((store: any) => ({
  render: store.editor?.render?.ctab?.render,
}))(InfoTooltip);
