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

import React, { useState, useMemo, useEffect } from 'react'
import classes from './FontControl.module.less'
import { range } from 'lodash/fp'

export const FontControl = ({ editorState, setEditorState, styles }) => {
  const defultFontSize = 13
  const [isShowingFontSizeMenu, setIsShowingFontSizeMenu] = useState(false)
  const [currentFontSize, setCurrentFontSize] = useState(`${defultFontSize}px`)

  const setFontSize = (e, value) => {
    e.preventDefault()
    setCurrentFontSize(value)
    const newEditorState = styles.fontSize.remove(editorState)
    setEditorState(styles.fontSize.add(newEditorState, value))
    setIsShowingFontSizeMenu(false)
  }

  const currentStyle = styles.fontSize.current(editorState) || currentFontSize

  useEffect(() => {
    setCurrentFontSize(currentStyle)
  })

  const MIN_FONT_SIZE = 4
  const MAX_FONT_SIZE = 144
  const fontSizes = range(MIN_FONT_SIZE, MAX_FONT_SIZE + 1)

  const fontSizeOptions = useMemo(
    () =>
      fontSizes.map(fontSize => (
        <div
          key={fontSize}
          className={classes.fontSizeOption}
          onMouseDown={e => setFontSize(e, `${fontSize}px`)}>
          {fontSize}
        </div>
      )),
    [isShowingFontSizeMenu]
  )

  return (
    <div>
      <button
        className={classes.fontBtn}
        onMouseDown={e => {
          e.preventDefault()
          setIsShowingFontSizeMenu(!isShowingFontSizeMenu)
        }}>
        {currentFontSize}
      </button>
      {isShowingFontSizeMenu ? (
        <div className={classes.fontSizeMenu}>{fontSizeOptions}</div>
      ) : null}
    </div>
  )
}

export default FontControl
