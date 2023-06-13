import action, { UiActionAction } from '../../../action'
import {
  ActionButton,
  ActionButtonProps
} from '../ToolbarGroupItem/ActionButton'
import { type ToolbarItemVariant } from '../toolbar.types'
import classes from './FloatingTools.module.less'
import { getIconName } from 'src/components'

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

const FLOATING_TOOLS: readonly ToolbarItemVariant[] = [
  'transform-flip-h',
  'transform-flip-v',
  'erase'
] as const

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
      {FLOATING_TOOLS.map((name) => {
        const iconName = getIconName(name === 'erase' ? 'delete' : name)
        return (
          iconName && (
            <ActionButton
              className={classes.item}
              // Note: erase button's icon is 'delete'
              name={iconName}
              action={action[name]}
              status={status[name] as ActionButtonProps['status']}
              selected={false}
              indigoVerification={indigoVerification}
              onAction={onAction}
              disableableButtons={[]}
              key={name}
            />
          )
        )
      })}
    </div>
  )
}
