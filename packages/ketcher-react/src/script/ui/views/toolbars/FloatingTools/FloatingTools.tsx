import { Vec2 } from 'ketcher-core'
import action, { UiActionAction } from '../../../action'
import {
  ActionButton,
  ActionButtonProps
} from '../ToolbarGroupItem/ActionButton'
import { type ToolbarItemVariant } from '../toolbar.types'
import classes from './FloatingTools.module.less'

export type FloatingToolsProps = {
  visible: boolean
  HandlePos: Vec2
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

// @yuleicul try FloatingToolItemVariant
const FLOATING_TOOLS: ToolbarItemVariant[] = [
  'transform-flip-h',
  'transform-flip-v',
  'erase'
]

export const FloatingTools: React.FC<Props> = ({
  visible,
  HandlePos,
  status,
  indigoVerification,
  onAction
}) => {
  if (!visible) return null

  // @yuleicul todo
  // 3. delete icon

  return (
    <div
      className={classes.wrapper}
      style={{ left: HandlePos.x, top: HandlePos.y }}
    >
      {FLOATING_TOOLS.map((id) => (
        <ActionButton
          className={classes.item}
          name={id}
          action={action[id]}
          status={status[id] as ActionButtonProps['status']}
          selected={false}
          indigoVerification={indigoVerification}
          onAction={onAction}
          disableableButtons={[]}
          key={id}
        />
      ))}
    </div>
  )
}
