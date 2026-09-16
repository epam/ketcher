import { useTranslation } from 'react-i18next';
import { IGroupBlockProps } from './types';
import { useAppSelector } from 'hooks';
import { selectIsEditMode } from 'state/rna-builder';
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
  selected,
  onClick,
  testid,
  children,
}: IGroupBlockProps & PropsWithChildren) => {
  const { t } = useTranslation('macromoleculesDialogs');
  const isEditMode = useAppSelector(selectIsEditMode);

  const empty = !monomerName;

  return (
    <CompactGroupBlockContainer
      selected={selected}
      onClick={onClick}
      isEditMode={isEditMode}
      data-testid={testid}
    >
      <>
        <CompactGroupConnection />
        <GroupIcon name={iconName} selected={selected} empty={empty} />
        <CompactGroupText selected={selected} empty={empty}>
          {monomerName ?? t(groupNameToRnaEditorItemLabelKey[groupName])}
        </CompactGroupText>
        {children}
      </>
    </CompactGroupBlockContainer>
  );
};
