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
import s from './FontControl.module.css'

export const FontControl = ({ editorState, setEditorState, styles }) => {
  const [isShowingFontSizeMenu, setIsShowingFontSizeMenu] = useState(false)

  const setFontSize = (e, value) => {
    e.preventDefault()
    const newEditorState = styles.fontSize.remove(editorState)
    setEditorState(styles.fontSize.add(newEditorState, value))
    setIsShowingFontSizeMenu(false)
  }

  const fontSizes = new Array(141).fill('')
  const fontSizeOptions = fontSizes.map((_, index) => {
    const fontSize = index + 4
    return (
      <div
        key={`font-size-${fontSize + 4}`}
        className={s.fontSizeOption}
        onMouseDown={e => setFontSize(e, `${fontSize + 4}px`)}>
        {fontSize + 4}
      </div>
    )
  })

  return (
    <div>
      <div className="font-size-dropdown">
        <button
          onMouseDown={e => {
            e.preventDefault()
            setIsShowingFontSizeMenu(!isShowingFontSizeMenu)
          }}>
          Size
        </button>
        {isShowingFontSizeMenu ? (
          <div className={s.fontSizeMenu}>{fontSizeOptions}</div>
        ) : null}
      </div>
    </div>
  )
}

export default FontControl
