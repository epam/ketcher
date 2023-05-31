import action, { UiActionAction } from '../../../action'
import {
  ActionButton,
  ActionButtonProps
} from '../ToolbarGroupItem/ActionButton'
import { type ToolbarItemVariant } from '../toolbar.types'
import classes from './FloatingTools.module.less'

export type FloatingToolsProps = {
  visible: boolean
  rotateHandlePosition: { x: number; y: number }
  status: {
    disabled?: boolean
    hidden?: boolean
  }
  indigoVerification: boolean
}
export type FloatingToolsCallProps = {
  onAction: (action: UiActionAction) => void
}
type Props = FloatingToolsProps & FloatingToolsCallProps

const FLOATING_TOOLS: ToolbarItemVariant[] = [
  'transform-flip-h',
  'transform-flip-v',
  'erase'
]

export const FloatingTools: React.FC<Props> = ({
  visible,
  rotateHandlePosition,
  status,
  indigoVerification,
  onAction
}) => {
  if (!visible) return null

  return (
    <div
      className={classes.wrapper}
      style={{ left: rotateHandlePosition.x, top: rotateHandlePosition.y }}
    >
      {FLOATING_TOOLS.map((name) => (
        <ActionButton
          className={classes.item}
          // Note: erase button's icon is 'delete'
          name={name === 'erase' ? 'delete' : name}
          action={action[name]}
          status={status[name] as ActionButtonProps['status']}
          selected={false}
          indigoVerification={indigoVerification}
          onAction={onAction}
          disableableButtons={[]}
          key={name}
        />
      ))}
    </div>
  )
}
