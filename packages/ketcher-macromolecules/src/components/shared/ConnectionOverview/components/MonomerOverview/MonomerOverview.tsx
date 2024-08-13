import { ReactNode } from 'react';
import { BaseMonomer } from 'ketcher-core';
import {
  AttachmentPointList,
  StyledStructRender,
} from './MonomerOverview.styles';
import UnresolvedMonomerPreview from 'components/preview/components/UnresolvedMonomerPreview/UnresolvedMonomerPreview';

interface Props {
  monomer: BaseMonomer;
  attachmentPoints: ReactNode;
  connectedAttachmentPoints?: string[];
  selectedAttachmentPoint?: string | null;
  update?: boolean;
  expanded?: boolean;
}

const MonomerOverview = ({
  monomer,
  attachmentPoints,
  connectedAttachmentPoints,
  selectedAttachmentPoint,
  update,
  expanded,
}: Props) => {
  const isUnresolvedMonomer = monomer.monomerItem.props.unresolved;

  return (
    <>
      {isUnresolvedMonomer ? (
        <UnresolvedMonomerPreview />
      ) : (
        <StyledStructRender
          struct={monomer.monomerItem.struct}
          options={{
            connectedMonomerAttachmentPoints: connectedAttachmentPoints,
            currentlySelectedMonomerAttachmentPoint:
              selectedAttachmentPoint ?? undefined,
            labelInMonomerConnectionsModal: true,
            needCache: false,
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
