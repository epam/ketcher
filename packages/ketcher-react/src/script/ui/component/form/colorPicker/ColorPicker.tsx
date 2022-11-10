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
import Icon from '../../../component/view/icon'

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
    (color) => {
      onChange(color)
    },
    [onChange]
  )

  const throttle = useCallback((func, limit) => {
    let inThrottle
    return (e) => {
      if (!inThrottle) {
        func(e)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  }, [])

  const handleClick = useCallback(
    throttle((e) => {
      e.preventDefault()
      setIsOpen((prev) => !prev)
      setIsPaletteOpen(false)
    }, 200),
    []
  )

  const handlePaletteOpen = () => {
    setIsPaletteOpen(true)
  }
  const handleColorChange = (color) => {
    handleChange(color)
  }

  const handleBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      handleClick(e)
    }
  }

  return (
    <div
      className={classes.colorPickerWrapper}
      data-testid={isOpen ? 'color-picker-field-open' : 'color-picker-field'}
      onClick={(e) => e.preventDefault()}
    >
      <div
        className={clsx({
          [classes.colorPickerInput]: true,
          [classes.selectedInput]: isOpen
        })}
        onClick={handleClick}
      >
        <div
          className={classes.colorPickerPreview}
          data-testid="color-picker-preview"
          style={{ backgroundColor: value }}
        />

        <Icon
          className={clsx({
            [classes.expandIcon]: true,
            [classes.turnedIcon]: !isOpen
          })}
          name="chevron"
        />
      </div>
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
            {presetColors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                style={{ backgroundColor: color }}
                className={classes.presetColor}
              />
            ))}
          </div>

          {isPaletteOpen && (
            <div className={classes.colorPicker} data-testid="color-palette">
              <HexColorPicker color={value} onChange={handleChange} />
              <div className={classes.colorContainer}>
                <span className={classes.hex}>HEX</span>
                <HexColorInput
                  data-testid="color-picker-input"
                  color={value}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ColorPicker
