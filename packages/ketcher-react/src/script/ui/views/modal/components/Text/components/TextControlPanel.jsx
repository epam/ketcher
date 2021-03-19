import React from 'react'
import TextButton from './TextButton'

export default function TextControlPanel() {
  const buttons = [
    {
      label: 'subscript',
      id: 1,
      dataCommand: 'subscript'
    },
    {
      label: 'superscript',
      id: 2,
      dataCommand: 'superscript'
    },
    {
      label: 'bold',
      id: 3,
      dataCommand: 'bold'
    },
    {
      label: 'italic',
      id: 4,
      dataCommand: 'italic'
    }
  ]

  return (
    <ul>
      {buttons.map(button => {
        return <TextButton button={button} key={button.id} />
      })}
    </ul>
  )
}
