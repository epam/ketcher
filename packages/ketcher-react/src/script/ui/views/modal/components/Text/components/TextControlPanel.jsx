import React from 'react'
import TextButton from './TextButton'

export default function TextControlPanel() {
  const buttons = [
    {
      label: 'subtext',
      id: 1
    },
    {
      label: 'supertext',
      id: 2
    },
    {
      label: 'bold',
      id: 3
    },
    {
      label: 'italic',
      id: 4
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
