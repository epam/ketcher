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

import React, { useCallback, useState } from 'react'

import { HexColorPicker, HexColorInput } from 'react-colorful'
import classes from './ColorPicker.module.less'

interface ColorPickerProps {
  value: string
  name: string
  schema: any
  type?: string
}

interface ColorPickerCallProps {
  onChange: (value: string) => void
}

type Props = ColorPickerProps & ColorPickerCallProps

const ColorPicker = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false)
  const { onChange, value } = props

  const handleChange = useCallback(
    color => {
      onChange(color)
    },
    [onChange]
  )
  const handleClick = () => {
    setIsOpen(isOpen => !isOpen)
  }
  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <div className={classes.colorPickerInput}>
      <div
        className={classes.colorPickerBtn}
        onClick={handleClick}
        data-testid="color-picker-btn">
        {props.value}
        <span
          className={classes.colorPickerPreview}
          data-testid="color-picker-preview"
          style={{ backgroundColor: value }}
        />
      </div>
      <div className={classes.colorPickerWrap}>
        {isOpen ? (
          <>
            <div
              className={classes.colorPickerOverlay}
              onClick={handleClose}
              data-testid="color-picker-overlay"
            />
            <div className={classes.colorPicker}>
              <HexColorPicker color={value} onChange={handleChange} />
              <HexColorInput color={value} onChange={handleChange} />
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}

export default ColorPicker
