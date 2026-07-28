import { type FC, useEffect, useRef, useState } from 'react';
import {
  type Render,
  type SGroup,
  Vec2,
  CoordinateTransformation,
} from 'ketcher-core';
import clsx from 'clsx';
import classes from './InfoPanel.module.less';
import { calculateMiddleCoordsForRect } from './helpers';

const BAR_PANEL_SIZE = 32;
const LEFT_PADDING_MULTIPLIER = 3;

function getPanelPositionRelativeToRect(
  clientX: number,
  clientY: number,
  sGroup: SGroup,
  render: Render,
  width: number,
  height: number,
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
    (line) => line.slice(1),
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

  const panelPositionInViewBox = CoordinateTransformation.canvasToView(
    new Vec2(x, y),
    render,
  );
  return panelPositionInViewBox;
}

function getDomBasedPosition(
  hoverRect: DOMRect,
  canvasRect: DOMRect,
  width: number,
  height: number,
): { x: number; y: number } {
  const viewportLeftLimit = BAR_PANEL_SIZE * LEFT_PADDING_MULTIPLIER + width;
  const viewportBottomLimit = canvasRect.height - BAR_PANEL_SIZE - height;
  const viewportRightLimit = canvasRect.width - BAR_PANEL_SIZE - width;

  const hoverCenterX = hoverRect.left + hoverRect.width / 2;
  const relativeClientX = hoverCenterX - canvasRect.left;
  const relativeClientY = hoverRect.bottom - canvasRect.top;

  // Default: center below the hover rect
  let x = hoverCenterX - width / 2 - canvasRect.left;
  let y = hoverRect.bottom - canvasRect.top;

  if (relativeClientY > viewportBottomLimit) {
    y = hoverRect.top - height - canvasRect.top;
  }

  if (relativeClientX > viewportRightLimit) {
    x = hoverRect.left - width - canvasRect.left;
    y = hoverRect.top + hoverRect.height / 2 - height / 2 - canvasRect.top;
  }

  if (relativeClientX < viewportLeftLimit) {
    x = hoverRect.right - canvasRect.left;
    y = hoverRect.top + hoverRect.height / 2 - height / 2 - canvasRect.top;
  }

  return { x, y };
}

interface SGroupDataRenderBaseProps {
  sGroupData: string | null;
  className?: string;
  'data-testid'?: string;
}

interface SGroupDataRenderRaphaelProps extends SGroupDataRenderBaseProps {
  clientX: number;
  clientY: number;
  render: Render;
  sGroup: SGroup;
  hoverRect?: undefined;
  canvasRect?: undefined;
}

interface SGroupDataRenderDomProps extends SGroupDataRenderBaseProps {
  hoverRect: DOMRect;
  canvasRect: DOMRect;
  clientX?: undefined;
  clientY?: undefined;
  render?: undefined;
  sGroup?: undefined;
}

type SGroupDataRenderProps =
  | SGroupDataRenderRaphaelProps
  | SGroupDataRenderDomProps;

const SGroupDataRender: FC<SGroupDataRenderProps> = (props) => {
  const { sGroupData, className } = props;
  const [wrapperHeight, setWrapperHeight] = useState(0);
  const [wrapperWidth, setWrapperWidth] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (wrapperRef.current) {
      setWrapperHeight(wrapperRef.current.clientHeight);
      setWrapperWidth(wrapperRef.current.clientWidth);
    }
  });

  const panelCoordinate =
    'hoverRect' in props && props.hoverRect && props.canvasRect
      ? getDomBasedPosition(
          props.hoverRect,
          props.canvasRect,
          wrapperWidth,
          wrapperHeight,
        )
      : getPanelPositionRelativeToRect(
          props.clientX as number,
          props.clientY as number,
          props.sGroup as SGroup,
          props.render as Render,
          wrapperWidth,
          wrapperHeight,
        );
  if (!panelCoordinate) return null;

  return (
    <div
      ref={wrapperRef}
      data-testid={props['data-testid']}
      style={{ left: panelCoordinate.x + 'px', top: panelCoordinate.y + 'px' }}
      className={clsx(classes.infoPanel, className)}
    >
      {sGroupData}
    </div>
  );
};

export default SGroupDataRender;
