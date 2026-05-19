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
  const functionalGroups = props.propsFromTrigger?.functionalGroups;

  const multipleMonomersSelected = (functionalGroups?.length ?? 0) > 1;

  const expandingDisabled =
    functionalGroups?.every((fg) => !canExpandMonomer(fg)) ?? false;

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
        data-testid={`${expandText}-option`}
        hidden={(params) => hidden(params, true)}
        onClick={(params) => action(params, true)}
        disabled={expandingDisabled}
      >
        {expandText}
      </Item>
      <Item
        {...props}
        data-testid={`${collapseText}-option`}
        hidden={(params) => hidden(params, false)}
        onClick={(params) => action(params, false)}
      >
        {collapseText}
      </Item>
    </>
  );
};

export default MacromoleculeMenuItems;
