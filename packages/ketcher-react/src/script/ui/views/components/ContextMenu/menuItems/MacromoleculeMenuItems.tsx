import {
  MacromoleculeContextMenuProps,
  MenuItemsProps,
} from '../contextMenu.types';
import { Item } from 'react-contexify';
import useMonomerExpansionHandlers, {
  canExpandMonomer,
} from '../hooks/useMonomerExpansionHandlers';

const MacromoleculeMenuItems = (
  props: MenuItemsProps<MacromoleculeContextMenuProps>,
) => {
  const [action, hidden] = useMonomerExpansionHandlers();

  const multipleMonomersSelected =
    props?.propsFromTrigger?.functionalGroups !== undefined &&
    props.propsFromTrigger.functionalGroups.length > 1;

  const expandingDisabled =
    props.propsFromTrigger?.functionalGroups !== undefined &&
    props.propsFromTrigger.functionalGroups.every(
      (fg) => !canExpandMonomer(fg),
    );

  const expandText = multipleMonomersSelected
    ? 'Expand monomers'
    : 'Expand monomer';
  const collapseText = multipleMonomersSelected
    ? 'Collapse monomers'
    : 'Collapse monomer';

  return (
    <>
      <Item
        {...props}
        hidden={(params) => hidden(params, true)}
        onClick={(params) => action(params, true)}
        disabled={expandingDisabled}
      >
        {expandText}
      </Item>
      <Item
        {...props}
        hidden={(params) => hidden(params, false)}
        onClick={(params) => action(params, false)}
      >
        {collapseText}
      </Item>
    </>
  );
};

export default MacromoleculeMenuItems;
