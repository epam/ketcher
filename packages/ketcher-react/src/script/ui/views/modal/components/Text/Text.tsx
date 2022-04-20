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
import { useCallback, useState } from 'react'

import { Dialog } from '../../../components'
import { DialogParams } from '../../../components/Dialog/Dialog'
import { FontControl } from './FontControl'
import { SpecialSymbolsButton } from './SpecialSymbols/SpecialSymbolsButton'
import { TextButton } from './TextButton'
import { TextCommand } from 'ketcher-core'
import classes from './Text.module.less'
import { connect } from 'react-redux'
import createStyles from 'draft-js-custom-styles'

const { styles, customStyleFn } = createStyles(['font-size'])

interface TextProps extends DialogParams {
  formState: any
  id?: any
  content: string
  position?: string
}

const specialButtons: Array<{ command: TextCommand; name: string }> = [
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

  const result = () => {
    const content = editorState.getCurrentContent()
    return {
      content: content.hasText() ? JSON.stringify(convertToRaw(content)) : '',
      position,
      id
    }
  }

  const keyBindingFn = (e: any): string | null => {
    if (e.keyCode === 13) {
      e.stopPropagation()
    }

    return getDefaultKeyBinding(e)
  }

  const onContentChange = (state: EditorState): void => {
    setEditorState(state)
  }

  const currentStyle = editorState.getCurrentInlineStyle()

  const toggleStyle = useCallback(
    (command: TextCommand): void => {
      let newEditorState: EditorState = editorState
      switch (command) {
        case TextCommand.Subscript: {
          if (currentStyle.has(TextCommand.Superscript)) {
            newEditorState = RichUtils.toggleInlineStyle(
              newEditorState,
              TextCommand.Superscript
            )
          }
          break
        }
        case TextCommand.Superscript: {
          if (currentStyle.has(TextCommand.Subscript)) {
            newEditorState = RichUtils.toggleInlineStyle(
              newEditorState,
              TextCommand.Subscript
            )
          }
          break
        }
      }
      newEditorState = RichUtils.toggleInlineStyle(newEditorState, command)

      setEditorState(newEditorState)
    },
    [currentStyle, editorState]
  )

  const customStyleMap: DraftStyleMap = {
    SUBSCRIPT: {
      verticalAlign: 'sub',
      transform: 'scale(0.7)',
      display: 'inline-block',
      transformOrigin: 'left'
    },
    SUPERSCRIPT: {
      verticalAlign: 'super',
      transform: 'scale(0.7)',
      display: 'inline-block',
      transformOrigin: 'left'
    }
  }

  return (
    <Dialog
      title="Text Editor"
      className={classes.textEditor}
      params={props}
      result={result}
      valid={() => formState.form.valid}
      buttonsNameMap={{ OK: 'Apply' }}
      buttons={['Cancel', 'OK']}
      withDivider
      needMargin>
      <div className={classes.contentWrapper}>
        <ul className={classes.controlPanel}>
          {specialButtons.map((button) => {
            return (
              <TextButton // кнопки стиля текста
                button={button}
                key={button.name}
                active={currentStyle.has(button.command)}
                toggleStyle={toggleStyle}
              />
            )
          })}

          <SpecialSymbolsButton // специальные символы раскрывашка
            editorState={editorState}
            setEditorState={setEditorState}
            styles={currentStyle}
          />

          <FontControl // размер шрифта
            editorState={editorState}
            setEditorState={setEditorState}
            styles={styles}
          />
        </ul>
        <div className={classes.textEditorInput}>
          <span>Text:</span>
          <div className={classes.editorWrapper}>
            <Editor
              keyBindingFn={keyBindingFn}
              editorState={editorState}
              onChange={onContentChange}
              customStyleMap={customStyleMap}
              customStyleFn={customStyleFn}
            />
          </div>
        </div>
      </div>
    </Dialog>
  )
}

export default connect((store) => ({ formState: (store as any).modal }))(Text)
