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

import { useState } from 'react'
import { MenuItem, Select, SelectChangeEvent } from '@mui/material'

import classes from './FontControl.module.less'

import { range } from 'lodash/fp'
// import { classes } from 'src/script/ui/views/toolbars/ToolbarGroupItem/ToolbarMultiToolItem/variants/DefaultMultiTool'

export const FontControl = ({ editorState, setEditorState, styles }) => {
  const defaultFontSize = 13
  const menuProps = {
    PaperProps: {
      style: {
        maxHeight: 150,
        width: 69
      }
    }
  }

  const [currentFontSize, setCurrentFontSize] = useState(defaultFontSize)

  const setFontSize = (event: SelectChangeEvent<number>) => {
    const {
      target: { value }
    } = event
    setCurrentFontSize(typeof value === 'string' ? Number(value) : value)
    const newEditorState = styles.fontSize.remove(editorState)
    setEditorState(styles.fontSize.add(newEditorState, `${value}px`))
  }
  // const currentStyle = styles.fontSize.current(editorState)

  const MIN_FONT_SIZE = 4
  const MAX_FONT_SIZE = 144
  const fontSizes = range(MIN_FONT_SIZE, MAX_FONT_SIZE + 1)

  // useEffect(() => {
  //   setCurrentFontSize(currentStyle || defaultFontSize)
  // }, [currentStyle])

  // const fontSizeOptions = useMemo(
  //   () =>
  //     fontSizes.map((fontSize) => (
  //       <div
  //         key={fontSize}
  //         className={classes.fontSizeOption}
  //         onMouseDown={(e) => setFontSize(e, `${fontSize}px`)}>
  //         {fontSize}
  //       </div>
  //     )),
  //   [isShowingFontSizeMenu]
  // )

  return (
    // <div>
    //   <button
    //     className={classes.fontBtn}
    //     onMouseDown={(e) => {
    //       e.preventDefault()
    //       setIsShowingFontSizeMenu(!isShowingFontSizeMenu)
    //     }}>
    //     {currentFontSize}
    //   </button>
    //   {isShowingFontSizeMenu ? (
    //     <div className={classes.fontSizeMenu}>{fontSizeOptions}</div>
    //   ) : null}
    // </div>
    <div>
      <label>
        Font Size
        <Select
          sx={{ width: 70, fontSize: 14 }}
          displayEmpty
          className={classes.select}
          multiple={false}
          MenuProps={menuProps}
          value={currentFontSize}
          onChange={setFontSize}
          defaultValue={defaultFontSize}
          renderValue={(selected) => selected}>
          {fontSizes.map((size) => (
            <MenuItem key={size} value={size}>
              {size}
            </MenuItem>
          ))}
        </Select>
      </label>
    </div>
  )
}

export default FontControl
