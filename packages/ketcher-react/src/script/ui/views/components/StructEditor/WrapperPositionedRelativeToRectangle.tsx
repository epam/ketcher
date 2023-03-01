import { useEffect, useRef, useState, FC } from 'react'
import { Vec2, Render, SGroup, Struct } from 'ketcher-core'
import clsx from 'clsx'
import classes from './InfoPanel.module.less'
import {
  calculateMiddleCoordsForRect,
  calculateScrollOffsetX,
  calculateScrollOffsetY
} from './helpers'

/* eslint-disable-line camelcase */
const BAR_PANEl_SIZE = 32
const LEFT_PADDING_MULTIPLIER = 3

function getPanelPositionRelativeToRect(
  clientX: number,
  clientY: number,
  sGroup: SGroup,
  render: Render,
  width: number,
  height: number
): Array<Vec2> {
  const viewportLeftLimit = BAR_PANEl_SIZE * LEFT_PADDING_MULTIPLIER + width
  const viewportBottomLimit =
    render?.clientArea?.clientHeight - BAR_PANEl_SIZE - height
  const viewportRightLimit =
    render?.clientArea?.clientWidth - BAR_PANEl_SIZE - width

  // We need to remove first element of the path. Example of the path => ['M', 23, 43]
  const rectCoords: Array<Array<number>> = sGroup.hovering.attrs?.path?.map(
    (line) => line.slice(1)
  )

  const [mLeftSide, mBottomSide, mRightSide, mTopSide] =
    calculateMiddleCoordsForRect(rectCoords)

  // Default position for panel is in the bottom;
  let x = mBottomSide.x - width / 2
  let y = mBottomSide.y

  if (clientY > viewportBottomLimit) {
    y = mTopSide.y - height
  }

  if (clientX > viewportRightLimit) {
    x = mLeftSide.x - width
    y = mLeftSide.y - height / 2
  }

  if (clientX < viewportLeftLimit) {
    x = mRightSide.x
    y = mRightSide.y - height / 2
  }

  x += calculateScrollOffsetX(render)
  y += calculateScrollOffsetY(render)

  return [new Vec2(x, y)]
}

interface WrapperPositionedRelativeToRectangleProps {
  clientX: number
  clientY: number
  render: Render
  groupStruct: Struct
  sGroup: SGroup
  sGroupData: string | null
  className?: string
}

const WrapperPositionedRelativeToRectangle: FC<
  WrapperPositionedRelativeToRectangleProps
> = (props) => {
  const { clientX, clientY, render, className, sGroup, sGroupData } = props
  const [wrapperHeight, setWrapperHeight] = useState(0)
  const [wrapperWidth, setWrapperWidth] = useState(0)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (wrapperRef.current) {
      setWrapperHeight(wrapperRef.current.clientHeight)
      setWrapperWidth(wrapperRef.current.clientWidth)
    }
  })

  const [coords] = getPanelPositionRelativeToRect(
    clientX,
    clientY,
    sGroup,
    render,
    wrapperWidth,
    wrapperHeight
  )

  const { x, y } = coords

  const style = { left: x + 'px', top: y + 'px' }

  return (
    <div
      ref={wrapperRef}
      style={style}
      className={clsx(classes.infoPanel, className)}
    >
      {sGroupData}
    </div>
  )
}

export default WrapperPositionedRelativeToRectangle
