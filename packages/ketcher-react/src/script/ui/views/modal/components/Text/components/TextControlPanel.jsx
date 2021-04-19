import React from 'react'
import TextButton from './TextButton'

const TextControlPanel = props => {
  const buttons = [
    {
      command: 'BOLD',
      name: 'text-bold'
    },
    {
      command: 'ITALIC',
      name: 'text-italic'
    },
    {
      command: 'SUBSCRIPT',
      name: 'text-subscript'
    },
    {
      command: 'SUPERSCRIPT',
      name: 'text-superscript'
    }
  ]

  return (
      <ul>
        {buttons.map(button => {
          return <TextButton
            button={button}
            key={button.name}
            toggleStyle={props.toggleStyle}/>
        })}
      </ul>
  )
}

export default TextControlPanel
