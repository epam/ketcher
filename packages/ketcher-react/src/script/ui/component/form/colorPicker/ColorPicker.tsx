import React, { useCallback, useState } from 'react'
import { CompactPicker } from 'react-color'

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

const ColorPicker: React.FC<Props> = props => {
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
    <div className="color-picker-input">
      <div
        className="color-picker-btn"
        onClick={handleClick}
        data-testid="color-picker-btn">
        {props.value}
        <span
          className="color-picker-preview"
          data-testid="color-picker-preview"
          style={{ backgroundColor: value }}
        />
      </div>
      <div className="color-picker-wrap">
        {isOpen ? (
          <>
            <div
              className="color-picker-overlay"
              onClick={handleClose}
              data-testid="color-picker-overlay"
            />
            <CompactPicker
              className="color-picker"
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
