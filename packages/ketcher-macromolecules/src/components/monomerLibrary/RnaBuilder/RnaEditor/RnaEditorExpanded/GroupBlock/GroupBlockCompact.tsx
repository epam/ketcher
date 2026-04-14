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
import { PropsWithChildren } from 'react';
import { AttachmentPointsSection } from '../AttachmentPointsSection';
import { getMonomerAttachmentPoints } from 'helpers/attachmentPoints';

export const GroupBlockCompact = ({
  groupName,
  iconName,
  monomerName,
  selected,
  onClick,
  testid,
  children,
  monomerItem,
}: IGroupBlockProps & PropsWithChildren) => {
  const isEditMode = useAppSelector(selectIsEditMode);

  const empty = !monomerName;

  // Collect all APs for this monomer (component tab: show all)
  const attachmentPoints = getMonomerAttachmentPoints(monomerItem);

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
          {monomerName ?? groupNameToRnaEditorItemLabel[groupName]}
        </CompactGroupText>
        {children}
        <!-- Show all APs for compact component tab -->
        {attachmentPoints.length > 0 && (
          <AttachmentPointsSection
            attachmentPoints={attachmentPoints}
            isEditMode={isEditMode}
          />
        )}
      </>
    </CompactGroupBlockContainer>
  );
};
