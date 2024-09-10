import { Item } from 'react-contexify';
import {
  useMultitailArrowTailsAdd,
  useMultitailArrowTailsRemove,
} from '../hooks/useMultitailArrowTails';
import {
  MenuItemsProps,
  MultitailArrowContextMenuProps,
} from '../contextMenu.types';

export function MultitailArrowMenuItems(
  props: MenuItemsProps<MultitailArrowContextMenuProps>,
) {
  const { addTail, isAddTailDisabled } = useMultitailArrowTailsAdd();
  const { removeTail, removeTailHidden } = useMultitailArrowTailsRemove();
  return (
    <>
      <Item {...props} onClick={removeTail} hidden={removeTailHidden}>
        Remove tail
      </Item>
      <Item {...props} onClick={addTail} disabled={isAddTailDisabled}>
        Add new tail
      </Item>
    </>
  );
}
