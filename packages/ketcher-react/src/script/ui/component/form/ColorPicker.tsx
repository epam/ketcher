import React, { useEffect, useState } from 'react'
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
  const [color, setColor] = useState<string>(props.value)

  useEffect(() => {
    setColor(props.value)
  }, [props.value])

  const handleClick = () => {
    setIsOpen(isOpen => !isOpen)
  }
  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <div className="color-picker-input">
      <div className="color-picker-btn" onClick={handleClick}>
        {props.value}
        <span
          className="color-picker-preview"
          style={{ backgroundColor: color }}
        />
      </div>
      <div className="color-picker-wrap">
        {isOpen ? (
          <>
            <div className="color-picker-overlay" onClick={handleClose} />
            <CompactPicker
              className="color-picker"
              color={color}
              onChange={value => props.onChange(value.hex)}
            />
          </>
        ) : null}
      </div>
    </div>
  )
}

export default ColorPicker
