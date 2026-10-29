import { useTranslation } from 'react-i18next';
import { IGroupBlockProps } from './types';
import { useAppSelector } from 'hooks';
import { isRnaBuilderEditMode } from 'state/rna-builder';
import {
  CompactGroupBlockContainer,
  CompactGroupConnection,
  CompactGroupText,
} from './styles';
import { groupNameToRnaEditorItemLabelKey } from './utils';
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
}: IGroupBlockProps & PropsWithChildren) => {
  const { t } = useTranslation('macromoleculesDialogs');
<<<<<<< HEAD
  const isEditMode = useAppSelector(selectIsEditMode);
=======
  const isEditMode = useAppSelector(isRnaBuilderEditMode);
>>>>>>> origin/master

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
<<<<<<< HEAD
        <GroupIcon name={iconName} selected={selected} empty={empty} />
        <CompactGroupText selected={selected} empty={empty}>
=======
        <GroupIcon name={iconName} selected={isSelected} empty={isEmpty} />
        <CompactGroupText selected={isSelected} empty={isEmpty}>
>>>>>>> origin/master
          {monomerName ?? t(groupNameToRnaEditorItemLabelKey[groupName])}
        </CompactGroupText>
        {children}
      </>
    </CompactGroupBlockContainer>
  );
};
