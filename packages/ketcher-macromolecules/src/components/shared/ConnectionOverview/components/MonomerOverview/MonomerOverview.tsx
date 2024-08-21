import { ReactNode } from 'react';
import { MonomerItemType, UsageInMacromolecule } from 'ketcher-core';
import {
  AttachmentPointList,
  StyledStructRender,
} from './MonomerOverview.styles';
import UnresolvedMonomerPreview from 'components/preview/components/UnresolvedMonomerPreview/UnresolvedMonomerPreview';

interface Props {
  monomer: MonomerItemType;
  attachmentPoints: ReactNode;
  usage: UsageInMacromolecule;
  connectedAttachmentPoints?: string[];
  selectedAttachmentPoint?: string | null;
  needCache?: boolean;
  update?: boolean;
  expanded?: boolean;
}

const MonomerOverview = ({
  monomer,
  attachmentPoints,
  connectedAttachmentPoints,
  selectedAttachmentPoint,
  usage,
  needCache,
  update,
  expanded,
}: Props) => {
  const isUnresolvedMonomer = monomer.props.unresolved;

  return (
    <>
      {isUnresolvedMonomer ? (
        <UnresolvedMonomerPreview />
      ) : (
        <StyledStructRender
          struct={monomer.struct}
          options={{
            connectedMonomerAttachmentPoints: connectedAttachmentPoints,
            currentlySelectedMonomerAttachmentPoint:
              selectedAttachmentPoint ?? undefined,
            usageInMacromolecule: usage,
            labelInMonomerConnectionsModal: true,
            needCache: needCache ?? false,
          }}
          update={update}
          isExpanded={expanded}
        />
      )}
      <AttachmentPointList>{attachmentPoints}</AttachmentPointList>
    </>
  );
};

export default MonomerOverview;
