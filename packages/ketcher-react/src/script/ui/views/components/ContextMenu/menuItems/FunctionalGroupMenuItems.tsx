import type { FC } from 'react';
import { Item } from 'react-contexify';
import { useTranslation } from 'react-i18next';
import useFunctionalGroupEoc from '../hooks/useFunctionalGroupEoc';
import useFunctionalGroupRemove from '../hooks/useFunctionalGroupRemove';
import type {
  FunctionalGroupsContextMenuProps,
  MenuItemsProps,
} from '../contextMenu.types';

const FunctionalGroupMenuItems: FC<
  MenuItemsProps<FunctionalGroupsContextMenuProps>
> = (props) => {
  const { t } = useTranslation(['components', 'dialogs']);
  const [handleExpandOrContract, ExpandOrContractHidden] =
    useFunctionalGroupEoc();
  const handleRemove = useFunctionalGroupRemove();

  return (
    <>
      <Item
        {...props}
        data-testid="Expand Abbreviation-option"
        hidden={(params) => ExpandOrContractHidden(params, true)}
        onClick={(params) => handleExpandOrContract(params, true)}
      >
        {t('components:contextMenu.expandAbbreviation')}
      </Item>
      <Item
        {...props}
        data-testid="Contract Abbreviation-option"
        hidden={(params) => ExpandOrContractHidden(params, false)}
        onClick={(params) => handleExpandOrContract(params, false)}
      >
        {t('components:contextMenu.contractAbbreviation')}
      </Item>
      <Item
        {...props}
        data-testid="Remove Abbreviation-option"
        onClick={handleRemove}
      >
        {t('dialogs:toolbox.removeFG.removeAbbreviation')}
      </Item>
    </>
  );
};

export default FunctionalGroupMenuItems;
