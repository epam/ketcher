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

import { EditorState, Modifier } from 'draft-js'

import Icon from '../../../../../component/view/icon'
import { SpecialSymbolsList } from '../SpecialSymbolsList/SpecialSymbolsList'
import classes from './SpecialSymbolsButton.module.less'
import { useState } from 'react'

const SpecialSymbolsButton = ({ editorState, setEditorState, styles }) => {
  const [showSpecialSymbols, setShowSpecialSymbols] = useState(false)

  const handleClose = (event) => {
    event.stopPropagation()
    event.preventDefault()
    setShowSpecialSymbols(false)
  }

  const closeSymbolsList = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      handleClose(event)
    }
  }

  const addSymbol = (e, value) => {
    e.preventDefault()
    const selection = editorState.getSelection()
    const contentState = editorState.getCurrentContent()
    const nextContentState = Modifier.replaceText(
      contentState,
      selection,
      value,
      styles
    )
    const nextEditorState = EditorState.push(
      editorState,
      nextContentState,
      'insert-characters'
    )
    setEditorState(nextEditorState)
    setShowSpecialSymbols(false)
  }

  return (
    <div onBlur={closeSymbolsList}>
      <button
        title="symbols"
        onMouseDown={(e) => {
          e.preventDefault()
          setShowSpecialSymbols(!showSpecialSymbols)
        }}
        className={
          showSpecialSymbols ? classes.activeTextButton : classes.textButton
        }
      >
        <Icon name="text-special-symbols" />
      </button>
      {showSpecialSymbols && <SpecialSymbolsList select={addSymbol} />}
    </div>
  )
}

export { SpecialSymbolsButton }
