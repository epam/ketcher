import { IGroupBlockProps } from './types';
import { useAppSelector } from 'hooks';
import { selectIsEditMode } from 'state/rna-builder';
import {
  CompactGroupBlockContainer,
  CompactGroupText,
  CompactIcon,
} from './styles';
import { groupNameToRnaEditorItemLabel } from './utils';
import { MonomerGroups } from '../../../../../../constants';

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
      empty={empty}
      isEditMode={isEditMode}
      isBase={groupName === MonomerGroups.BASES}
      data-testid={testid}
    >
      <CompactIcon empty={empty} selected={selected} name={iconName} />
      <CompactGroupText selected={selected} empty={empty}>
        {monomerName || groupNameToRnaEditorItemLabel[groupName]}
      </CompactGroupText>
    </CompactGroupBlockContainer>
  );
};
