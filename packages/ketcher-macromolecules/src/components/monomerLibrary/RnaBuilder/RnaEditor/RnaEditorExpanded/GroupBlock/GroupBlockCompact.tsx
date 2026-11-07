import { useTranslation } from 'react-i18next';
import { IGroupBlockProperties } from './types';
import { useAppSelector } from 'hooks';
import { isRnaBuilderEditMode } from 'state/rna-builder';
import {
  CompactGroupBlockContainer,
  CompactGroupConnection,
  CompactGroupText,
} from './styles';
import { groupNameToRnaEditorItemLabelKey } from './utilities';
import GroupIcon from './GroupIcon';
import { PropsWithChildren } from 'react';

export const GroupBlockCompact = ({
  groupName,
  iconName,
  monomerName,
  selected: isSelected,
  onClick,
  testid,
  children,
}: IGroupBlockProperties & PropsWithChildren) => {
  const { t } = useTranslation('macromoleculesDialogs');
  const isEditMode = useAppSelector(isRnaBuilderEditMode);

  const isEmpty = !monomerName;

  return (
    <CompactGroupBlockContainer
      selected={isSelected}
      onClick={onClick}
      isEditMode={isEditMode}
      data-testid={testid}
    >
      <>
        <CompactGroupConnection />
        <GroupIcon name={iconName} selected={isSelected} empty={isEmpty} />
        <CompactGroupText selected={isSelected} empty={isEmpty}>
          {monomerName ?? t(groupNameToRnaEditorItemLabelKey[groupName])}
        </CompactGroupText>
        {children}
      </>
    </CompactGroupBlockContainer>
  );
};
