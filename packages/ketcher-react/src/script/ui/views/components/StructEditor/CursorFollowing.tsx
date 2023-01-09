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

import { useCallback, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import Editor from 'src/script/editor'
import { CursorFollowingSubscriberPayload } from 'src/script/editor/tool/template'
import StructRender from 'src/script/ui/component/structrender'
import { Template } from 'src/script/ui/dialog/template/TemplateTable'
import classes from './CursorFollowing.module.less'

interface CursorFollowingProps {
  selectedTemplate?: Template
  editor?: Editor
}

const CursorFollowing: React.FC<CursorFollowingProps> = ({
  selectedTemplate,
  editor
}) => {
  const [disabled, setDisabled] = useState(true)
  const [dynamicStyles, setDynamicStyles] = useState({
    transform: 'none'
  })

  const updatePosition = useCallback(
    (offsetX: number, offsetY: number) => {
      if (!editor) return

      const scrollTop = editor.render.clientArea?.scrollTop || 0
      const scrollLeft = editor.render.clientArea?.scrollLeft || 0
      const x = offsetX - scrollLeft
      const y = offsetY - scrollTop

      const scale = editor.render.options.zoom

      setDynamicStyles({
        transform: `translate(${x}px, ${y}px) scale(${scale})`
      })
    },
    [editor]
  )

  const subscriber = useCallback(
    (payload: CursorFollowingSubscriberPayload) => {
      if (disabled !== payload.disabled) {
        setDisabled(payload.disabled)
      }

      updatePosition(payload.offsetX, payload.offsetY)
    },
    [disabled, updatePosition]
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
