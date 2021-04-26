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

import React, { useState } from 'react'
import { connect } from 'react-redux'
import {
  Editor,
  EditorState,
  RichUtils,
  RawDraftContentState,
  convertFromRaw,
  convertToRaw,
  getDefaultKeyBinding,
  DraftStyleMap
} from 'draft-js'
import { Dialog } from '../../../components'
import { DialogParams } from '../../../components/Dialog/Dialog'
import TextControlPanel, { TextStyle } from './components/TextControlPanel'
import classes from './Text.module.less'
import 'draft-js/dist/Draft.css'

interface TextProps extends DialogParams {
  formState: any
  type: string
  id?: any
  rawContent: RawDraftContentState
  position?: string
}

const Text = (props: TextProps) => {
  const { formState, position, id, type } = props

  const [editorState, setEditorState] = useState<EditorState>(
    EditorState.moveFocusToEnd(
      EditorState.createWithContent(
        convertFromRaw(props.rawContent || { blocks: [], entityMap: {} })
      )
    )
  )

  const result = () => ({
    rawContent: convertToRaw(editorState.getCurrentContent()),
    position,
    id,
    type
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

  const toggleStyle = (command: TextStyle): void => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, command))
  }

  const customStyleMap: DraftStyleMap = {
    SUBSCRIPT: { fontSize: '0.8em', verticalAlign: 'sub' },
    SUPERSCRIPT: { fontSize: '0.8em', verticalAlign: 'super' }
  }

  return (
    <Dialog
      className="textEditor"
      title="Text editor"
      manageFocus={false}
      params={props}
      result={result}
      valid={() => formState.form.valid}>
      <TextControlPanel
        className={classes.controlPanel}
        toggleStyle={toggleStyle}
        editorState={editorState}
      />
      <div className={classes.textEditorInput}>
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
