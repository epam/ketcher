import clsx from 'clsx'
import classes from './ButtonGenSet.module.less'

const ButtonGenSet = ({
  button,
  disabledQueryElements,
  onAtomSelect,
  selected
}) => {
  const isDisabled = disabledQueryElements?.includes(button.label)
  const titleText = isDisabled
    ? `${button.label} is disabled`
    : button.description || button.label

  return (
    <button
      onClick={() => onAtomSelect(button.label, false)}
      onDoubleClick={() => onAtomSelect(button.label, true)}
      title={titleText}
      disabled={isDisabled}
      className={clsx(
        {
          [classes.selected]: selected(button.label)
        },
        classes.button
      )}
    >
      {button.label}
    </button>
  )
}

export default ButtonGenSet
