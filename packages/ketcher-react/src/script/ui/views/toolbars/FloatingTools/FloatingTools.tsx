import action, { type UiActionAction } from '../../../action';
import {
  type ActionButtonProperties,
  ActionButton,
} from '../ToolbarGroupItem/ActionButton';
import { type ToolbarItemVariant } from '../toolbar.types';
import classes from './FloatingTools.module.less';
import { getIconName } from 'components';

const FLOATING_ERASE_TEST_ID = 'float-delete';

export type FloatingToolsProperties = {
  visible: boolean;
  rotateHandlePosition: { x: number; y: number };
  status: {
    disabled?: boolean;
    hidden?: boolean;
  };
  indigoVerification: boolean;
};
export type FloatingToolsCallProperties = {
  onAction: (action: UiActionAction) => void;
};
type Properties = FloatingToolsProperties & FloatingToolsCallProperties;

const FLOATING_TOOLS: readonly ToolbarItemVariant[] = [
  'transform-flip-h',
  'transform-flip-v',
  'erase',
] as const;

export const FloatingTools: React.FC<Properties> = ({
  visible,
  rotateHandlePosition,
  status,
  indigoVerification,
  onAction,
}) => {
  if (!visible) return null;

  return (
    <div
      className={classes.wrapper}
      style={{ left: rotateHandlePosition.x, top: rotateHandlePosition.y }}
      data-testid="floating-tools"
    >
      {FLOATING_TOOLS.map((name) => {
        const iconName = getIconName(name === 'erase' ? 'delete' : name);
        return (
          iconName && (
            <ActionButton
              className={classes.item}
              // Note: erase button's icon is 'delete'
              name={iconName}
              action={action[name]}
              status={status[name] as ActionButtonProperties['status']}
              selected={false}
              indigoVerification={indigoVerification}
              onAction={onAction}
              disableableButtons={[]}
              dataTestId={name === 'erase' ? FLOATING_ERASE_TEST_ID : undefined}
              key={name}
            />
          )
        );
      })}
    </div>
  );
};
