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

import { useState, useEffect, FC } from 'react'
import { Scale, Vec2, Render, Struct, SGroup } from 'ketcher-core'

import SGroupDataRender from './SGroupDataRender'
import { calculateScrollOffsetX, calculateScrollOffsetY } from './helpers'
import { functionGroupInfoSelector } from '../../../state/functionalGroups/selectors'
import { connect } from 'react-redux'
import clsx from 'clsx'
import { StructRender } from 'components'

import classes from './InfoPanel.module.less'

const HOVER_PANEL_PADDING = 20

function getSGroupFirstAtom(sGroup: SGroup, render: Render): Vec2 {
  const { firstSgroupAtom, firstSgroupAtomId } = sGroup
  if (firstSgroupAtom) return firstSgroupAtom.pp
  return render.ctab.atoms?.get(firstSgroupAtomId)?.a.pp || new Vec2(0, 0)
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
    x += calculateScrollOffsetX(render)
    y += calculateScrollOffsetY(render)
  }

  return [new Vec2(x, y), new Vec2(width, height)]
}
interface InfoPanelProps {
  clientX: number | undefined
  clientY: number | undefined
  render: Render
  groupStruct: Struct
  sGroup: SGroup
  className?: string
}

const InfoPanel: FC<InfoPanelProps> = (props) => {
  const { clientX, clientY, render, className, groupStruct, sGroup } = props
  const [molecule, setMolecule] = useState<Struct | null>(null)
  const [sGroupData, setSGroupData] = useState<string | null>(null)
  const groupName = sGroup?.data?.name

  useEffect(() => {
    if (sGroup && SGroup.isDataSGroup(sGroup)) {
      setSGroupData(`${sGroup.data?.fieldName}=${sGroup.data?.fieldValue}`)
    } else {
      setSGroupData(null)
    }
  }, [groupStruct, sGroup])

  useEffect(() => {
    setMolecule(groupStruct ? groupStruct.clone() : null)
  }, [groupName, groupStruct])

  const nonTooltipSGroup =
    !sGroup || SGroup.isMulSGroup(sGroup) || SGroup.isSRUSGroup(sGroup)

  if (
    nonTooltipSGroup ||
    (!molecule && !sGroupData) ||
    clientX === undefined ||
    clientY === undefined
  ) {
    return null
  }

  const [position, size] = getPanelPosition(clientX, clientY, render, sGroup)
  const { x, y } = position
  const width = size.x
  const height = size.y

  const showMolecule = molecule && sGroup && !SGroup.isDataSGroup(sGroup)

  return showMolecule ? (
    <div
      style={{
        left: x + 'px',
        top: y + 'px'
      }}
      className={clsx(classes.infoPanel, className)}
    >
      <StructRender
        struct={molecule}
        options={{
          ...render.options,
          autoScale: true,
          autoScaleMargin: 0,
          rescaleAmount: 1,
          cachePrefix: 'infoPanel',
          needCache: false,
          width,
          height
        }}
      />
    </div>
  ) : (
    <SGroupDataRender
      clientX={clientX}
      clientY={clientY}
      render={render}
      groupStruct={groupStruct}
      sGroup={sGroup}
      sGroupData={sGroupData}
      className={className}
    />
  )
}

export default connect((store: any) => ({
  clientX: functionGroupInfoSelector(store)?.event?.clientX,
  clientY: functionGroupInfoSelector(store)?.event?.clientY,
  groupStruct: functionGroupInfoSelector(store)?.groupStruct || null,
  sGroup: functionGroupInfoSelector(store)?.sGroup || null,
  render: store.editor?.render?.ctab?.render
}))(InfoPanel)
