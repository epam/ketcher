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
import { Scale, Vec2, Struct, ReStruct } from 'ketcher-core'

import StructRender from '../../../component/structrender'
import { functionGroupInfoSelector } from '../../../state/functionalGroups/selectors'
import { connect } from 'react-redux'
import clsx from 'clsx'

import classes from './InfoPanel.module.less'

const HOVER_DELAY = 400

const allSGroupsSelector = (store) => {
  const result = [...store.functionalGroups.lib, ...store.saltsAndSolvents.lib]
  return result
}

const options = {
  autoScale: true,
  autoScaleMargin: 0
}

function calculateInfoPanelPosition(
  mouseX: number,
  mouseY: number,
  groupId: number,
  functionGroupStruct: Struct,
  options: any = {}
): Vec2[] {
  const paddingSize = options.atomSelectionPlateRadius || 10

  let width = 0
  let height = 0
  let rX = 0
  let rY = 0

  if (functionGroupStruct) {
    const vbox = functionGroupStruct.sgroups?.get(groupId)?.item?.areas[0]
    if (vbox) {
      const start = Scale.obj2scaled(vbox.p0, options)
      const end = Scale.obj2scaled(vbox.p1, options)
      width = end.x - start.x
      height = end.y - start.y
    }

    // @ts-ignore
    var groupStructPosition =
      functionGroupStruct?.sgroups?.get(groupId)?.firstSgroupAtom?.pp
    let panelPosition = Scale.obj2scaled(groupStructPosition, options)
    rX = panelPosition.x + paddingSize
    rY = panelPosition.y + paddingSize
    if (mouseX > functionGroupStruct.render?.clientArea?.clientWidth - width) {
      rX = panelPosition.x - width - paddingSize
    }
    if (
      mouseY >
      functionGroupStruct.render?.clientArea?.clientHeight - height
    ) {
      rY = panelPosition.y - height - paddingSize * 2
    }
  }
  return [new Vec2(rX, rY), new Vec2(width, height)]
}

interface InfoPanelProps {
  groupName: string
  mouseX: number
  mouseY: number
  groupId: number
  restruct: ReStruct
  functionGroupStruct: Struct
  group: Struct
  className?: string
}

const InfoPanel: FC<InfoPanelProps> = (props) => {
  const {
    groupName,
    mouseX = 0,
    mouseY = 0,
    groupId,
    restruct,
    functionGroupStruct,
    className,
    group
  } = props
  const [molecule, setMolecule] = useState(null)
  const childRef = useRef(null)

  let timer: any = -1

  useEffect(() => {
    if (group) {
      const clonedGroup = group.clone()
      clonedGroup.name = groupName
      timer = setTimeout(() => {
        setMolecule(clonedGroup)
      }, HOVER_DELAY)
    } else {
      setMolecule(null)
    }
    return () => clearTimeout(timer)
  }, [groupName])

  const [position, size] = calculateInfoPanelPosition(
    mouseX,
    mouseY,
    groupId,
    functionGroupStruct,
    restruct.render.options
  )

  return (
    molecule && (
      <div
        style={{
          top: position.y,
          left: position.x
        }}
        className={clsx(classes.infoPanel, className)}
      >
        <StructRender
          struct={molecule}
          {...props}
          id={groupName}
          ref={childRef}
          options={{
            ...restruct.render.options,
            ...options,
            viewSz: new Vec2(size.x, size.y),
            autoScaleMargin: 0,
            rescaleAmount: 1,
            width: size.x,
            height: size.y
          }}
        />
      </div>
    )
  )
}
export default connect((store) => ({
  groupName: functionGroupInfoSelector(store)
    ? functionGroupInfoSelector(store).id
    : null,
  mouseX: functionGroupInfoSelector(store)
    ? functionGroupInfoSelector(store).x
    : 0,
  mouseY: functionGroupInfoSelector(store)
    ? functionGroupInfoSelector(store).y
    : 0,
  restruct: store.editor?.render.ctab,
  editorStruct: store.editor?.struct(),
  groupId: functionGroupInfoSelector(store)
    ? functionGroupInfoSelector(store).groupId
    : null,
  functionalGroups: allSGroupsSelector(store).map((template) => {
    const struct = template.struct.clone()
    struct.sgroups.delete(0)
    return { ...template, modifiedStruct: struct }
  })
}))(InfoPanel)
