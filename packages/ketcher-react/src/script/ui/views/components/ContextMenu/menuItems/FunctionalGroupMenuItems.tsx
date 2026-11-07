import type { FC } from 'react';
import { Item } from 'react-contexify';
import { useTranslation } from 'react-i18next';
import useFunctionalGroupEoc from '../hooks/useFunctionalGroupEoc';
import useFunctionalGroupRemove from '../hooks/useFunctionalGroupRemove';
import type {
  FunctionalGroupsContextMenuProperties,
  MenuItemsProperties,
} from '../contextMenu.types';

const FunctionalGroupMenuItems: FC<
  MenuItemsProperties<FunctionalGroupsContextMenuProperties>
> = (properties) => {
  const { t } = useTranslation(['components', 'dialogs']);
  const [handleExpandOrContract, ExpandOrContractHidden] =
    useFunctionalGroupEoc();
  const handleRemove = useFunctionalGroupRemove();

  return (
    <>
      <Item
        {...properties}
        data-testid="Expand Abbreviation-option"
        hidden={(parameters) => ExpandOrContractHidden(parameters, true)}
        onClick={(parameters) => handleExpandOrContract(parameters, true)}
      >
        {t('components:contextMenu.expandAbbreviation')}
      </Item>
      <Item
        {...properties}
        data-testid="Contract Abbreviation-option"
        hidden={(parameters) => ExpandOrContractHidden(parameters, false)}
        onClick={(parameters) => handleExpandOrContract(parameters, false)}
      >
        {t('components:contextMenu.contractAbbreviation')}
      </Item>
      <Item
        {...properties}
        data-testid="Remove Abbreviation-option"
        onClick={handleRemove}
      >
        {t('dialogs:toolbox.removeFG.removeAbbreviation')}
      </Item>
    </>
  );
};

export default FunctionalGroupMenuItems;
