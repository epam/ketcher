import { Item } from 'react-contexify';
import { useTranslation } from 'react-i18next';
import {
  useMultitailArrowTailsAdd,
  useMultitailArrowTailsRemove,
} from '../hooks/useMultitailArrowTails';
import type {
  MenuItemsProperties,
  MultitailArrowContextMenuProperties,
} from '../contextMenu.types';

export function MultitailArrowMenuItems(
  properties: Readonly<
    MenuItemsProperties<MultitailArrowContextMenuProperties>
  >,
) {
  const { t } = useTranslation('components');
  const { addTail, isAddTailDisabled } = useMultitailArrowTailsAdd();
  const { removeTail, removeTailHidden } = useMultitailArrowTailsRemove();
  return (
    <>
      <Item
        {...properties}
        data-testid="Remove tail-option"
        onClick={removeTail}
        hidden={removeTailHidden}
      >
        {t('contextMenu.removeTail')}
      </Item>
      <Item
        {...properties}
        data-testid="Add new tail-option"
        onClick={addTail}
        disabled={isAddTailDisabled}
      >
        {t('contextMenu.addNewTail')}
      </Item>
    </>
  );
}
