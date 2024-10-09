import {
  MacromoleculeContextMenuProps,
  MenuItemsProps,
} from '../contextMenu.types';
import { Item } from 'react-contexify';
import useMonomerExpansionHandlers from '../hooks/useMonomerExpansionHandlers';

const MacromoleculeMenuItems = (
  props: MenuItemsProps<MacromoleculeContextMenuProps>,
) => {
  const [action, hidden] = useMonomerExpansionHandlers();

  return (
    <>
      <Item
        {...props}
        hidden={(params) => hidden(params, true)}
        onClick={(params) => action(params, true)}
      >
        Expand monomer
      </Item>
      <Item
        {...props}
        hidden={(params) => hidden(params, false)}
        onClick={(params) => action(params, false)}
      >
        Collapse monomer
      </Item>
    </>
  );
};

export default MacromoleculeMenuItems;
