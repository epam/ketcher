import { useEffect, useRef, useState, FC } from 'react';
import { Vec2, Render, SGroup, Struct } from 'ketcher-core';
import clsx from 'clsx';
import classes from './InfoPanel.module.less';
import {
  calculateMiddleCoordsForRect,
  calculateScrollOffsetX,
  calculateScrollOffsetY,
} from './helpers';

const BAR_PANEL_SIZE = 32;
const LEFT_PADDING_MULTIPLIER = 3;

function getPanelPositionRelativeToRect(
  clientX: number,
  clientY: number,
  sGroup: SGroup,
  render: Render,
  width: number,
  height: number
): Vec2 | null {
  const viewportLeftLimit = BAR_PANEL_SIZE * LEFT_PADDING_MULTIPLIER + width;
  const viewportBottomLimit =
    render?.clientArea?.clientHeight - BAR_PANEL_SIZE - height;
  const viewportRightLimit =
    render?.clientArea?.clientWidth - BAR_PANEL_SIZE - width;

  if (!sGroup.hovering) {
    return null;
  }

  // [['M', 23, 43], ['L', 23, 24]] we should remove first elements => [[23,43], [23,24]]
  const rectCoords: Array<Array<number>> = sGroup.hovering.attrs?.path?.map(
    (line) => line.slice(1)
  );

  const [middleLeftSide, middleBottomSide, middleRightSide, middleTopSide] =
    calculateMiddleCoordsForRect(rectCoords);

  if (
    !middleBottomSide?.x ||
    !middleBottomSide?.y ||
    !middleTopSide?.y ||
    !middleLeftSide?.x ||
    !middleLeftSide?.y ||
    !middleRightSide?.x ||
    !middleRightSide?.y
  ) {
    return null;
  }

  // Default position for panel is in the bottom;
  let x = middleBottomSide.x - width / 2;
  let y = middleBottomSide.y;

  if (clientY > viewportBottomLimit) {
    y = middleTopSide.y - height;
  }

  if (clientX > viewportRightLimit) {
    x = middleLeftSide.x - width;
    y = middleLeftSide.y - height / 2;
  }

  if (clientX < viewportLeftLimit) {
    x = middleRightSide.x;
    y = middleRightSide.y - height / 2;
  }

  x += calculateScrollOffsetX(render);
  y += calculateScrollOffsetY(render);

  return new Vec2(x, y);
}

interface SGroupDataRenderProps {
  clientX: number;
  clientY: number;
  render: Render;
  groupStruct: Struct;
  sGroup: SGroup;
  sGroupData: string | null;
  className?: string;
}

const SGroupDataRender: FC<SGroupDataRenderProps> = (props) => {
  const { clientX, clientY, render, className, sGroup, sGroupData } = props;
  const [wrapperHeight, setWrapperHeight] = useState(0);
  const [wrapperWidth, setWrapperWidth] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (wrapperRef.current) {
      setWrapperHeight(wrapperRef.current.clientHeight);
      setWrapperWidth(wrapperRef.current.clientWidth);
    }
  });

  const panelCoordinate = getPanelPositionRelativeToRect(
    clientX,
    clientY,
    sGroup,
    render,
    wrapperWidth,
    wrapperHeight
  );

  return panelCoordinate ? (
    <div
      ref={wrapperRef}
      style={{ left: panelCoordinate.x + 'px', top: panelCoordinate.y + 'px' }}
      className={clsx(classes.infoPanel, className)}
    >
      {sGroupData}
    </div>
  ) : null;
};

export default SGroupDataRender;
