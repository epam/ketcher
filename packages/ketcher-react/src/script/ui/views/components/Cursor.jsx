import React from 'react'
import { useState, useEffect } from 'react'

const Cursor = (props) => {
  const [position, setPosition] = useState({
    clientX: 0,
    clientY: 0
  })
  const Icon = props.icon
  const PressedIcon = props.pressedIcon
  const [mousedown, setMouseDown] = useState(false)

  const updatePosition = (event) => {
    const { pageX, pageY, clientX, clientY } = event

    setPosition({
      clientX,
      clientY
    })
  }
  const handleMouseDown = () => {
    setMouseDown(true)
  }
  const handleMouseUp = () => {
    setMouseDown(false)
  }

  const handleMouseOver = (event) => {
    const { pageX, pageY, clientX, clientY } = event

    setPosition({
      clientX,
      clientY
    })
  }
  useEffect(() => {
    document.addEventListener('mousemove', updatePosition, false)
    document.addEventListener('mouseenter', updatePosition, false)
    document.addEventListener('mousedown', handleMouseDown, false)
    document.addEventListener('mouseup', handleMouseUp, false)

    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mousemove', updatePosition)
      document.removeEventListener('mouseenter', updatePosition)
    }
  }, [])
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        pointerEvents: 'none',
        visibility: props.enable
      }}
    >
      {mousedown ? (
        <PressedIcon
          style={{
            position: 'absolute',
            left: position.clientX,
            top: position.clientY
          }}
        />
      ) : (
        <Icon
          style={{
            position: 'absolute',
            left: position.clientX,
            top: position.clientY
          }}
        />
      )}
    </div>
  )
}
export default Cursor
