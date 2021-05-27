import Icon from '../../../../../component/view/icon'
import React from 'react'
import { TextStyle } from '../text.types'
import clsx from 'clsx'
import styles from './TextButton.module.less'

interface TextButtonProps {
  button: { command: TextStyle; name: string }
  active: boolean
}

interface TextButtonPropsCallProps {
  toggleStyle: (command: TextStyle) => void
}

type Props = TextButtonProps & TextButtonPropsCallProps

export const TextButton = (props: Props) => {
  const toggleStyle = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    command: TextStyle
  ) => {
    event.preventDefault()
    props.toggleStyle(command)
  }

  return (
    <button
      className={clsx(styles.textButton, { [styles.isActive]: props.active })}
      title={props.button.command.toLowerCase()}
      onMouseDown={event => {
        toggleStyle(event, props.button.command)
      }}>
      <Icon name={props.button.name} />
    </button>
  )
}
