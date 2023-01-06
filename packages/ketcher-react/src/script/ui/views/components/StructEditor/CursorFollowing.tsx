/****************************************************************************
 * Copyright 2023 EPAM Systems
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

import { throttle } from 'lodash/fp'
import { useCallback, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import Editor from 'src/script/editor'
import { CursorFollowingSubscriberPayload } from 'src/script/editor/tool/template'
import StructRender from 'src/script/ui/component/structrender'
import { Template } from 'src/script/ui/dialog/template/TemplateTable'
import classes from './CursorFollowing.module.less'

const setTransform = throttle(100, (x, y) => `translate(${x}px, ${y}px)`)

// TODO: @yulei use requestAnimationFrame to optimize the animation
// const setTransform = requestAnimationFrame((x, y) => {})

interface CursorFollowingProps {
  selectedTemplate?: Template
  editor?: Editor
}

const CursorFollowing: React.FC<CursorFollowingProps> = ({
  selectedTemplate,
  editor
}) => {
  const [disabled, setDisabled] = useState(true)
  const [offsetXY, setOffsetXY] = useState({
    x: 0,
    y: 0
  })
  const [dynamicStyles, setDynamicStyles] = useState({
    transform: 'none'
  })

  useEffect(() => {
    if (!editor) return

    const scrollTop = editor.render.clientArea?.scrollTop || 0
    const scrollLeft = editor.render.clientArea?.scrollLeft || 0

    setDynamicStyles((styles) => ({
      transform:
        setTransform(offsetXY.x - scrollLeft, offsetXY.y - scrollTop) ||
        styles.transform
    }))
  }, [editor, offsetXY.x, offsetXY.y])

  const subscriber = useCallback(
    (payload: CursorFollowingSubscriberPayload) => {
      if (disabled !== payload.disabled) setDisabled(payload.disabled)
      setOffsetXY({
        x: payload.offsetX,
        y: payload.offsetY
      })
    },
    [disabled]
  )

  useEffect(() => {
    editor?.event.cursorFollowingChange.add(subscriber)
    return () => {
      editor?.event.cursorFollowingChange.remove(subscriber)
    }
  }, [editor, subscriber])

  const templateGroup = selectedTemplate?.props?.group
  // Custom template means the template in the modal other than on the bottom toolbar
  const isCustomTemplate = templateGroup !== undefined
  const isFunctionalGroupOrSaltOrSolvent =
    templateGroup === 'Functional Groups' ||
    templateGroup === 'Salts and Solvents'

  return (
    <>
      {!disabled && isCustomTemplate && selectedTemplate ? (
        <div className={classes.wrapper} style={dynamicStyles}>
          {isFunctionalGroupOrSaltOrSolvent ? (
            <div className={classes.text}>{selectedTemplate.struct.name}</div>
          ) : (
            // todo @yulei the center not overlapped when stereotype
            <StructRender
              id={selectedTemplate.struct?.name}
              struct={selectedTemplate.struct}
              options={{
                ...editor?.render.options,
                cachePrefix: 'cursorFollowing',
                autoScale: true,
                autoScaleMargin: 0,
                rescaleAmount: 1
              }}
            />
          )}
        </div>
      ) : null}
    </>
  )
}

const mapStateToProps = (state) => {
  const activeTool = state.actionState?.activeTool?.tool
  const selectedTemplate =
    activeTool === 'template' ? state.actionState?.activeTool?.opts : undefined

  return {
    selectedTemplate,
    editor: state.editor
  }
}

export default connect(mapStateToProps)(CursorFollowing)
