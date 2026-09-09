import { Item } from 'react-contexify';
import { useTranslation } from 'react-i18next';
import {
  useMultitailArrowTailsAdd,
  useMultitailArrowTailsRemove,
} from '../hooks/useMultitailArrowTails';
import type {
  MenuItemsProps,
  MultitailArrowContextMenuProps,
} from '../contextMenu.types';

export function MultitailArrowMenuItems(
  props: Readonly<MenuItemsProps<MultitailArrowContextMenuProps>>,
) {
  const { t } = useTranslation('components');
  const { addTail, isAddTailDisabled } = useMultitailArrowTailsAdd();
  const { removeTail, removeTailHidden } = useMultitailArrowTailsRemove();
  return (
    <>
      <Item
        {...props}
        data-testid="Remove tail-option"
        onClick={removeTail}
        hidden={removeTailHidden}
      >
        {t('contextMenu.removeTail')}
      </Item>
      <Item
        {...props}
        data-testid="Add new tail-option"
        onClick={addTail}
        disabled={isAddTailDisabled}
      >
        {t('contextMenu.addNewTail')}
      </Item>
    </>
  );
}
