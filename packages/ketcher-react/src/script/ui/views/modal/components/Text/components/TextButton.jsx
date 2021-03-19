import React from 'react'

function TextButton({ button }) {
  return (
    <button
      data-command={button.dataCommand}
      onClick={() => {
        debugger
        let cmd = button.dataCommand
        document.execCommand(cmd, false, null)
      }}>
      {button.label}
    </button>
  )
}

export default TextButton
