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

import { useState, useEffect, useRef } from 'react'
import { Scale, ReStruct, Vec2 } from 'ketcher-core'

import StructRender from '../../../component/structrender'
// import { setRef } from '@mui/material'
import {
  functionalGroupsSelector,
  functionGroupInfoSelector
} from '../../../state/functionalGroups/selectors'
import { saltsAndSolventsSelector } from '../../../state/saltsAndSolvents/selectors'
import { connect, useSelector } from 'react-redux'
import { render } from '@testing-library/react'
import clsx from 'clsx'

import classes from './InfoPanel.module.less'

const HOVER_DELAY = 400

const allSGroupsSelector = (store) => {
  const result = [...store.functionalGroups.lib, ...store.saltsAndSolvents.lib]
  console.log('result', result)
  return result
}

const options = {
  autoScale: true,
  autoScaleMargin: 0
}

const InfoPanel = (props) => {
  const {
    id,
    functionalGroups,
    x = 0,
    y = 0,
    groupId,
    restruct,
    baba,
    className
  } = props
  const [molecule, setMolecule] = useState(null)
  const childRef = useRef(null)

  let timer = -1

  const pos = baba?.sgroups.get(groupId)?.areas[0].p1
  if (pos) console.log(Scale.obj2scaled(pos, restruct.render.options))

  let gr = null

  useEffect(() => {
    const group = functionalGroups
      ? functionalGroups.find((g) => g.modifiedStruct.name === id)
      : null
    if (group) {
      gr = group.modifiedStruct.clone()
      gr.name = id
      timer = setTimeout(() => {
        setMolecule(gr)
      }, HOVER_DELAY)
    } else {
      setMolecule(null)
    }
    return () => clearTimeout(timer)
  }, [id])

  useEffect(() => {
    console.log('44ooo', molecule)
    childRef?.current?.forceUpdate()
  }, [molecule])

  console.log('restruct.render.options')
  console.log(restruct?.render?.options)
  let width = 0
  let height = 0
  let rX = 0
  let rY = 0
  if (baba) {
    const vbox = restruct.sgroups?.get(groupId)?.item?.areas[0]
    console.log('vbox2: ', vbox)
    if (vbox) {
      const start = Scale.obj2scaled(vbox.p0, restruct.render.options)
      const end = Scale.obj2scaled(vbox.p1, restruct.render.options)
      width = end.x - start.x
      height = end.y - start.y
    }
    const { atomSelectionPlateRadius = 10 } =
      restruct.render.options.atomSelectionPlateRadius
    const padding = atomSelectionPlateRadius
    var pos2 = baba?.sgroups?.get(groupId)?.firstSgroupAtom?.pp
    let panelPosition = pos2
      ? Scale.obj2scaled(pos2, restruct.render.options)
      : { x: 0, y: 0 }
    rX = panelPosition.x - width / 2 - 10
    rY = panelPosition.y + 32
  }

  return (
    molecule && (
      <div
        style={{
          position: 'absolute',
          left: rX + 'px',
          top: rY + 'px',
          padding: '20px',
          background: 'white',
          border: '1px solid #b4b9d6',
          borderRadius: '3px',
          pointerEvents: 'none'
        }}
        className={clsx(classes.huy, className)}
      >
        <StructRender
          struct={molecule}
          {...props}
          id={id}
          ref={childRef}
          options={{
            ...restruct.render.options,
            ...options,
            viewSz: new Vec2(width, height),
            rescaleOffset: {
              x: 10,
              y: 10,
              z: 0
            },
            autoScaleMargin: 0,
            rescaleAmount: 1,
            width: width,
            height: height
          }}
        />
      </div>
    )
  )
}

export default connect((store) => ({
  // settings: (state) => state.options.settings,
  // highlight: highlightSelector(store),
  id: functionGroupInfoSelector(store)
    ? functionGroupInfoSelector(store).id
    : null,
  x: functionGroupInfoSelector(store) ? functionGroupInfoSelector(store).x : 0,
  y: functionGroupInfoSelector(store) ? functionGroupInfoSelector(store).y : 0,
  restruct: store.editor?.render?.ctab,
  baba: store.editor?.struct(),
  groupId: functionGroupInfoSelector(store)
    ? functionGroupInfoSelector(store).groupId
    : null,
  functionalGroups: allSGroupsSelector(store).map((template) => {
    const struct = template.struct.clone()
    struct.sgroups.delete(0)
    return { ...template, modifiedStruct: struct }
  })
}))(InfoPanel)
