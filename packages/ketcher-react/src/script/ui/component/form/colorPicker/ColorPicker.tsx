import React, { useCallback, useState } from 'react'
import { CompactPicker } from 'react-color'
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
      onChange(color.hex)
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
            <CompactPicker
              className={classes.colorPicker}
              color={value}
              onChange={handleChange}
            />
          </>
        ) : null}
      </div>
    </div>
  )
}

export default ColorPicker
