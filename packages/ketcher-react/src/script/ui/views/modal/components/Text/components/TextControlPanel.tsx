import React from 'react'
import TextButton from './TextButton'
import { EditorState } from 'draft-js'

interface ControlPanelProps {
  editorState: EditorState
  className: string
}

interface ControlPanelPropsCallProps {
  toggleStyle: (command: TextStyle) => void
}

type Props = ControlPanelProps & ControlPanelPropsCallProps

export enum TextStyle {
  Bold = 'BOLD',
  Italic = 'ITALIC',
  Subscript = 'SUBSCRIPT',
  Superscript = 'SUPERSCRIPT'
}

const buttons: Array<{ command: TextStyle; name: string }> = [
  {
    command: TextStyle.Bold,
    name: 'text-bold'
  },
  {
    command: TextStyle.Italic,
    name: 'text-italic'
  },
  {
    command: TextStyle.Subscript,
    name: 'text-subscript'
  },
  {
    command: TextStyle.Superscript,
    name: 'text-superscript'
  }
]

const TextControlPanel = ({ editorState, toggleStyle, className }: Props) => {
  const currentStyle = editorState.getCurrentInlineStyle()

  return (
    <ul className={className}>
      {buttons.map(button => {
        return (
          <TextButton
            button={button}
            key={button.name}
            active={currentStyle.has(button.command)}
            toggleStyle={toggleStyle}
          />
        )
      })}
    </ul>
  )
}

export default TextControlPanel
