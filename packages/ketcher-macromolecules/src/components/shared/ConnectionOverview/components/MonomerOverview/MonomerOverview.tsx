import { ReactNode } from 'react';
import {
  AmbiguousMonomer,
  BaseMonomer,
  UsageInMacromolecule,
} from 'ketcher-core';
import {
  AttachmentPointList,
  StyledStructRender,
} from './MonomerOverview.styles';
import UnresolvedMonomerPreview from 'components/preview/components/UnresolvedMonomerPreview/UnresolvedMonomerPreview';
import MonomerMiniature from 'components/shared/ConnectionOverview/components/MonomerMiniature/MonomerMiniature';

interface Props {
  monomer: BaseMonomer;
  attachmentPoints: ReactNode;
  usage: UsageInMacromolecule;
  connectedAttachmentPoints?: string[];
  selectedAttachmentPoint?: string | null;
  needCache?: boolean;
  update?: boolean;
  expanded?: boolean;
  testId?: string;
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
  testId,
}: Props) => {
  const isAmbiguousMonomer = monomer instanceof AmbiguousMonomer;
  const isUnresolvedMonomer = monomer.monomerItem.props.unresolved;

  let monomerPreviewContent: ReactNode;

  if (isAmbiguousMonomer) {
    monomerPreviewContent = (
      <MonomerMiniature
        monomer={monomer}
        expanded={expanded}
        selectedAttachmentPoint={selectedAttachmentPoint}
        connectedAttachmentPoints={connectedAttachmentPoints}
        usage={usage}
        testId={testId}
      />
    );
  } else if (isUnresolvedMonomer) {
    monomerPreviewContent = <UnresolvedMonomerPreview testId={testId} />;
  } else {
    monomerPreviewContent = (
      <StyledStructRender
        struct={monomer.monomerItem.struct}
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
        testId={testId}
      />
    );
  }

  return (
    <>
      {monomerPreviewContent}
      <AttachmentPointList>
        <>{attachmentPoints}</>
      </AttachmentPointList>
    </>
  );
};

export default MonomerOverview;
