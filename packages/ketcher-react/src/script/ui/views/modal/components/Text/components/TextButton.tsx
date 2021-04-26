import React from 'react'
import clsx from 'clsx'
import Icon from '../../../../../component/view/icon'

import classes from './TextButton.module.less'
import { TextStyle } from './TextControlPanel'

interface TextButtonProps {
  button: { command: TextStyle; name: string }
  active: boolean
}

interface TextButtonPropsCallProps {
  toggleStyle: (command: TextStyle) => void
}

type Props = TextButtonProps & TextButtonPropsCallProps

const TextButton = (props: Props) => {
  const toggleStyle = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    command: TextStyle
  ) => {
    event.preventDefault()
    props.toggleStyle(command)
  }

  return (
    <button
      className={clsx(classes.textButton, { [classes.isActive]: props.active })}
      title={props.button.command.toLowerCase()}
      onMouseDown={event => {
        toggleStyle(event, props.button.command)
      }}>
      <Icon name={props.button.name} />
    </button>
  )
}

export default TextButton
