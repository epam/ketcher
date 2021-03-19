import React from 'react'

function TextButton({ button }) {
  return (
    <button onClick={() => console.log(`clicked on ${button.label}`)}>
      {button.label}
    </button>
  )
}

export default TextButton
