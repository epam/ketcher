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

import { useState, useEffect, useRef, FC } from 'react'
import { Scale, Vec2, Render, Struct, SGroup } from 'ketcher-core'

import StructRender from '../../../component/structrender'
import { functionGroupInfoSelector } from '../../../state/functionalGroups/selectors'
import { connect } from 'react-redux'
import clsx from 'clsx'

import classes from './InfoPanel.module.less'

const HOVER_DELAY = 400
const HOVER_PANEL_PADDING = 20

function getSGroupFirstAtom(sGroup: SGroup, render: Render): Vec2 {
  const { firstSgroupAtom } = sGroup
  if (firstSgroupAtom) return firstSgroupAtom.pp
  const [firstAtomId] = sGroup.atoms
  return render.ctab.atoms?.get(firstAtomId)?.a.pp || new Vec2(0, 0)
}

function getPanelPosition(
  clientX: number,
  clientY: number,
  render: Render,
  sGroup: SGroup
): [Vec2, Vec2] {
  let width = 0
  let height = 0
  let x = 0
  let y = 0

  if (sGroup) {
    // calculate width and height
    const groupBoundingBox = sGroup.areas[0]
    const start = Scale.obj2scaled(groupBoundingBox.p0, render.options)
    const end = Scale.obj2scaled(groupBoundingBox.p1, render.options)
    width = end.x - start.x
    height = end.y - start.y
    // calculate initial position
    const firstAtomPosition = getSGroupFirstAtom(sGroup, render)
    const panelPosition = Scale.obj2scaled(firstAtomPosition, {
      scale: render.options.scale * render.options.zoom
    })
    x = panelPosition.x - width / 2 - HOVER_PANEL_PADDING
    y = panelPosition.y + HOVER_PANEL_PADDING
    // adjust position to keep inside viewport
    const viewportRightLimit = render?.clientArea?.clientWidth - width / 2
    const viewportLeftLimit = HOVER_PANEL_PADDING * 2 + width / 2
    const viewportBottomLimit = render?.clientArea?.clientHeight - height
    if (clientX > viewportRightLimit) {
      x = panelPosition.x - width - HOVER_PANEL_PADDING
    } else if (clientX < viewportLeftLimit) {
      x = panelPosition.x - HOVER_PANEL_PADDING
    }
    if (clientY > viewportBottomLimit) {
      y = panelPosition.y - height - HOVER_PANEL_PADDING * 3
    }
    // adjust position to current scroll offset
    const scrollOffsetX =
      render?.options.offset?.x - render?.clientArea?.scrollLeft
    const scrollOffsetY =
      render?.options?.offset?.y - render?.clientArea?.scrollTop
    x += scrollOffsetX
    y += scrollOffsetY
  }

  return [new Vec2(x, y), new Vec2(width, height)]
}

interface InfoPanelProps {
  clientX: number
  clientY: number
  render: Render
  groupStruct: Struct
  sGroup: SGroup
  className?: string
}

const InfoPanel: FC<InfoPanelProps> = (props) => {
  const {
    clientX = 0,
    clientY = 0,
    render,
    className,
    groupStruct,
    sGroup
  } = props
  const [molecule, setMolecule] = useState<Struct | null>(null)
  const [sGroupData, setSGroupData] = useState<string | null>(null)
  const childRef = useRef(null)
  const groupName = sGroup?.data?.name

  useEffect(() => {
    if (!groupStruct && sGroup && sGroup.type === 'DAT') {
      setSGroupData(`${sGroup.data?.fieldName}=${sGroup.data?.fieldValue}`)
    } else {
      setSGroupData(null)
    }
  }, [groupStruct, sGroup])

  useEffect(() => {
    let timer
    if (groupStruct) {
      timer = setTimeout(() => {
        setMolecule(groupStruct.clone())
      }, HOVER_DELAY)
    } else {
      setMolecule(null)
    }
    return () => clearTimeout(timer)
  }, [groupName, groupStruct])

  const [position, size] = getPanelPosition(clientX, clientY, render, sGroup)
  const { x, y } = position
  const width = size.x
  const height = size.y

  if (!molecule && !sGroupData) {
    return null
  }

  return molecule ? (
    <div
      style={{
        left: x + 'px',
        top: y + 'px'
      }}
      className={clsx(classes.infoPanel, className)}
    >
      <StructRender
        struct={molecule}
        id={groupName}
        ref={childRef}
        options={{
          ...render.options,
          autoScale: true,
          autoScaleMargin: 0,
          rescaleAmount: 1,
          cachePrefix: 'infoPanel',
          viewSz: new Vec2(width, height),
          width: width,
          height: height
        }}
      />
    </div>
  ) : (
    <div
      style={{
        left: x + 'px',
        top: y + 'px'
      }}
      className={clsx(classes.infoPanel, className)}
    >
      {sGroupData}
    </div>
  )
}

export default connect((store: any) => ({
  clientX: functionGroupInfoSelector(store)?.event?.clientX || 0,
  clientY: functionGroupInfoSelector(store)?.event?.clientY || 0,
  groupStruct: functionGroupInfoSelector(store)?.groupStruct || null,
  sGroup: functionGroupInfoSelector(store)?.sGroup || null,
  render: store.editor?.render?.ctab?.render
}))(InfoPanel)
