import { FC } from 'react';
import { Item } from 'react-contexify';
import useFunctionalGroupEoc from '../hooks/useFunctionalGroupEoc';
import useFunctionalGroupRemove from '../hooks/useFunctionalGroupRemove';
import {
  FunctionalGroupsContextMenuProps,
  MenuItemsProps,
} from '../contextMenu.types';

const FunctionalGroupMenuItems: FC<
  MenuItemsProps<FunctionalGroupsContextMenuProps>
> = (props) => {
  const [handleExpandOrContract, ExpandOrContractHidden] =
    useFunctionalGroupEoc();
  const handleRemove = useFunctionalGroupRemove();

  return (
    <>
      <Item
        {...props}
        hidden={(params) => ExpandOrContractHidden(params, true)}
        onClick={(params) => handleExpandOrContract(params, true)}
      >
        Expand Abbreviation
      </Item>
      <Item
        {...props}
        hidden={(params) => ExpandOrContractHidden(params, false)}
        onClick={(params) => handleExpandOrContract(params, false)}
      >
        Contract Abbreviation
      </Item>
      <Item {...props} onClick={handleRemove}>
        Remove Abbreviation
      </Item>
    </>
  );
};

export default FunctionalGroupMenuItems;
