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

import 'draft-js/dist/Draft.css'

import {
  DraftStyleMap,
  Editor,
  EditorState,
  RawDraftContentState,
  RichUtils,
  convertFromRaw,
  convertToRaw,
  getDefaultKeyBinding
} from 'draft-js'
import React, { useCallback, useState } from 'react'

import { Dialog } from '../../../components'
import { DialogParams } from '../../../components/Dialog/Dialog'
import { TextButton } from './TextButton'
import { TextCommand } from 'ketcher-core'
import { connect } from 'react-redux'
import styles from './Text.module.less'

interface TextProps extends DialogParams {
  formState: any
  id?: any
  content: string
  position?: string
}

const buttons: Array<{ command: TextCommand; name: string }> = [
  {
    command: TextCommand.Bold,
    name: 'text-bold'
  },
  {
    command: TextCommand.Italic,
    name: 'text-italic'
  },
  {
    command: TextCommand.Subscript,
    name: 'text-subscript'
  },
  {
    command: TextCommand.Superscript,
    name: 'text-superscript'
  }
]

const Text = (props: TextProps) => {
  const { formState, position, id } = props
  const rawContentState: RawDraftContentState | null = props.content
    ? (JSON.parse(props.content) as RawDraftContentState)
    : null
  const [editorState, setEditorState] = useState<EditorState>(
    EditorState.moveFocusToEnd(
      EditorState.createWithContent(
        convertFromRaw(rawContentState || { blocks: [], entityMap: {} })
      )
    )
  )

  const result = () => ({
    content: JSON.stringify(convertToRaw(editorState.getCurrentContent())),
    position,
    id
  })

  const myKeyBindingFn = (e: any): string | null => {
    if (e.keyCode === 13) {
      e.stopPropagation()
    }

    return getDefaultKeyBinding(e)
  }

  const onContentChange = (state: EditorState): void => {
    setEditorState(state)
  }

  const toggleStyle = useCallback(
    (command: TextCommand): void => {
      setEditorState(RichUtils.toggleInlineStyle(editorState, command))
    },
    [editorState]
  )

  const customStyleMap: DraftStyleMap = {
    SUBSCRIPT: { fontSize: '0.8em', verticalAlign: 'sub' },
    SUPERSCRIPT: { fontSize: '0.8em', verticalAlign: 'super' }
  }

  const currentStyle = editorState.getCurrentInlineStyle()

  return (
    <Dialog
      className="textEditor"
      title="Text editor"
      params={props}
      result={result}
      valid={() => formState.form.valid}>
      <ul className={styles.controlPanel}>
        {buttons.map(button => {
          return (
            <TextButton
              button={button}
              key={button.name}
              active={currentStyle.has(button.command)}
              toggleStyle={toggleStyle}
            />
          )
        })}
      </ul>
      <div className={styles.textEditorInput}>
        <Editor
          keyBindingFn={myKeyBindingFn}
          editorState={editorState}
          onChange={onContentChange}
          customStyleMap={customStyleMap}
        />
      </div>
    </Dialog>
  )
}

export default connect(store => ({ formState: store.modal }))(Text)
