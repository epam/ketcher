import React, {useState} from 'react'
import clsx from 'clsx'
import Icon from '../../../../../component/view/icon'

import classes from './TextButton.module.less'

const TextButton = props => {
  const [isActive, setActive] = useState(false)
  const toggleStyle = (event, command) => {
    event.preventDefault()
    props.toggleStyle(command)
  }

  const toggleActive = () => { setActive(!isActive) }

  return (
    <button
      className={clsx(classes.textButton, { [classes.isActive]: isActive })}
      onClick={ toggleActive }
      onMouseDown={event => { toggleStyle(event, props.button.command) }}>
      <Icon name={props.button.name} />
    </button>
  )
}

export default TextButton
