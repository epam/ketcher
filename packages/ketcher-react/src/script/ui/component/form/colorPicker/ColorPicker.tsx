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

import { useCallback, useState } from 'react'

import { HexColorPicker, HexColorInput } from 'react-colorful'
import classes from './ColorPicker.module.less'
import clsx from 'clsx'

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

const presetColors = [
  '#FF4545',
  '#FFAD31',
  '#68D442',
  '#3ACACC',
  '#4434FF',
  '#9C9C9C',
  '#000000'
]

const ColorPicker = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isPaletteOpen, setIsPaletteOpen] = useState(false)
  const { onChange, value } = props

  const handleChange = useCallback(
    color => {
      onChange(color)
    },
    [onChange]
  )
  const handleClick = e => {
    e.preventDefault()
    setIsOpen(prev => !prev)
  }
  const handleClose = () => {
    setIsOpen(false)
    setIsPaletteOpen(false)
  }
  const handlePaletteOpen = () => {
    setIsPaletteOpen(true)
  }
  const handleColorChange = color => {
    handleChange(color)
  }

  const handleBlur = e => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      handleClose()
    }
  }

  return (
    <div
      className={classes.colorPickerInput}
      data-testid="color-picker-field"
      onClick={e => e.preventDefault()}
    >
      <button
        className={classes.colorPickerPreview}
        data-testid="color-picker-preview"
        style={{ backgroundColor: value }}
        onClick={handleClick}
      />

      {isOpen && (
        <div
          className={clsx(
            classes.colorPickerWrap,
            isPaletteOpen && classes.withPalette
          )}
          onBlur={handleBlur}
          data-testid="color-picker-preset"
        >
          <div className={classes.presetColors}>
            <button
              className={clsx(
                classes.chooseColor,
                isPaletteOpen && classes.clicked
              )}
              onClick={handlePaletteOpen}
              autoFocus
              data-testid="color-picker-btn"
            />
            {presetColors.map(color => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                style={{ backgroundColor: color }}
                className={classes.presetColor}
              />
            ))}
          </div>

          {isPaletteOpen && (
            <div className={classes.colorPicker}>
              <HexColorPicker color={value} onChange={handleChange} />
              <HexColorInput
                data-testid="color-picker-input"
                color={value}
                onChange={handleChange}
              />
              <span className={classes.hex}>HEX</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ColorPicker
