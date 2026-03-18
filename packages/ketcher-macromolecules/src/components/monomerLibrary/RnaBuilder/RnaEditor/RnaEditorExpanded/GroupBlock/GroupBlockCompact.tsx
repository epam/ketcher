import { IGroupBlockProps } from './types';
import { useAppSelector } from 'hooks';
import { selectIsEditMode } from 'state/rna-builder';
import {
  CompactGroupBlockContainer,
  CompactGroupConnection,
  CompactGroupText,
} from './styles';
import { groupNameToRnaEditorItemLabel } from './utils';
import GroupIcon from './GroupIcon';

export const GroupBlockCompact = ({
  groupName,
  iconName,
  monomerName,
  selected,
  onClick,
  testid,
}: IGroupBlockProps) => {
  const isEditMode = useAppSelector(selectIsEditMode);

  const empty = !monomerName;

  return (
    <CompactGroupBlockContainer
      selected={selected}
      onClick={onClick}
      isEditMode={isEditMode}
      data-testid={testid}
    >
      <CompactGroupConnection />
      <GroupIcon name={iconName} selected={selected} empty={empty} />
      <CompactGroupText selected={selected} empty={empty}>
        {monomerName || groupNameToRnaEditorItemLabel[groupName]}
      </CompactGroupText>
    </CompactGroupBlockContainer>
  );
};
