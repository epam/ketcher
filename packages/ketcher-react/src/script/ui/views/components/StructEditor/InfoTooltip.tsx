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
): CursorPosition {
  const width = 140;

  // adjust position to keep inside viewport
  const viewportRightLimit = render?.clientArea?.clientWidth - width / 2;
  position.y -= tooltipOffset.y;
  position.x -= tooltipOffset.x;

  if (position.x > viewportRightLimit) {
    position.x = position.x - width - HOVER_PANEL_PADDING;
  }
  if (position.y < 0) {
    position.y = position.y + HOVER_PANEL_PADDING;
  }

  return position;
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
    const debouncedShowTooltip = debounce((event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const tooltip = target.dataset.tooltip;
      if (tooltip) {
        setTooltip(tooltip);
        setPosition({
          x: event.clientX,
          y: event.clientY,
        });
      }
    }, TOOLTIP_DELAY);

    const hideTooltip = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const tooltip = target.dataset.tooltip;
      if (tooltip) {
        setTooltip(null);
        setPosition({
          x: null,
          y: null,
        });
      }
    };

    document.addEventListener('mouseover', debouncedShowTooltip);
    document.addEventListener('mouseout', hideTooltip);
    return () => {
      document.removeEventListener('mouseover', debouncedShowTooltip);
      document.removeEventListener('mouseout', hideTooltip);
    };
  }, []);

  if (!tooltip || !position.x || !position.y) {
    return null;
  }

  const shiftedPosition = getPanelPosition(position, render);

  return (
    <div
      id="atomInfoTooltip"
      role="tooltip"
      style={{
        left: shiftedPosition.x + 'px',
        top: shiftedPosition.y + 'px',
      }}
      className={clsx(classes.infoTooltip, className)}
      dangerouslySetInnerHTML={{ __html: tooltip }}
    />
  );
};

export default connect((store: any) => ({
  render: store.editor?.render?.ctab?.render,
}))(InfoTooltip);
