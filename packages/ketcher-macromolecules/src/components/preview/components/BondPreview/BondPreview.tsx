import styled from '@emotion/styled';
import { useAppSelector } from 'hooks';
import { selectShowPreview } from 'state/common';
import ConnectionOverview from 'components/shared/ConnectionOverview/ConnectionOverview';
import MonomerOverview from 'components/shared/ConnectionOverview/components/MonomerOverview/MonomerOverview';
import { useAttachmentPoints } from '../../hooks/useAttachmentPoints';
import { Container } from './BondPreview.styles';
import BondAttachmentPoints from 'components/preview/components/BondAttachmentPoints/BondAttachmentPoints';
import { UsageInMacromolecule } from 'ketcher-core';
import { BondPreviewState } from 'state';
import { preview } from 'ketcher-react';

interface Props {
  className?: string;
}

const BondPreview = ({ className }: Props) => {
  const preview = useAppSelector(selectShowPreview) as BondPreviewState;

  const { polymerBond, style } = preview;

  // Show the monomers in the same left-to-right order as on the canvas,
  // whichever end the bond was created from (e.g. a 5' phosphate of a preset)
  const isBondDrawnRightToLeft = Boolean(
    polymerBond.secondMonomer &&
    polymerBond.firstMonomer.position.x > polymerBond.secondMonomer.position.x,
  );
  const [
    firstMonomer,
    secondMonomer,
    firstMonomerAttachmentPoint,
    secondMonomerAttachmentPoint,
  ] = isBondDrawnRightToLeft
    ? [
        polymerBond.secondMonomer,
        polymerBond.firstMonomer,
        polymerBond.secondMonomerAttachmentPoint,
        polymerBond.firstMonomerAttachmentPoint,
      ]
    : [
        polymerBond.firstMonomer,
        polymerBond.secondMonomer,
        polymerBond.firstMonomerAttachmentPoint,
        polymerBond.secondMonomerAttachmentPoint,
      ];

  const {
    preparedAttachmentPointsData: firstMonomerPreparedAPsData,
    connectedAttachmentPoints: firstMonomerConnectedAPs,
  } = useAttachmentPoints({
    monomerCaps: firstMonomer?.monomerCaps,
    attachmentPointsToBonds: firstMonomer?.attachmentPointsToBonds,
  });

  const {
    preparedAttachmentPointsData: secondMonomerPreparedAPsData,
    connectedAttachmentPoints: secondMonomerConnectedAPs,
  } = useAttachmentPoints({
    monomerCaps: secondMonomer?.monomerCaps,
    attachmentPointsToBonds: secondMonomer?.attachmentPointsToBonds,
  });

  if (!firstMonomer || !secondMonomer) {
    return null;
  }

  return (
    <Container
      className={className}
      data-testid="polymer-library-preview"
      style={{ top: style?.top, left: style?.left, right: style?.right }}
    >
      <ConnectionOverview
        firstMonomer={firstMonomer}
        secondMonomer={secondMonomer}
        firstMonomerOverview={
          <MonomerOverview
            monomer={firstMonomer}
            usage={UsageInMacromolecule.BondPreview}
            connectedAttachmentPoints={firstMonomerConnectedAPs}
            selectedAttachmentPoint={firstMonomerAttachmentPoint}
            attachmentPoints={
              <BondAttachmentPoints
                attachmentPoints={firstMonomerPreparedAPsData}
                attachmentPointInBond={firstMonomerAttachmentPoint}
              />
            }
          />
        }
        secondMonomerOverview={
          <MonomerOverview
            monomer={secondMonomer}
            usage={UsageInMacromolecule.BondPreview}
            connectedAttachmentPoints={secondMonomerConnectedAPs}
            selectedAttachmentPoint={secondMonomerAttachmentPoint}
            attachmentPoints={
              <BondAttachmentPoints
                attachmentPoints={secondMonomerPreparedAPsData}
                attachmentPointInBond={secondMonomerAttachmentPoint}
              />
            }
          />
        }
      />
    </Container>
  );
};

const StyledPreview = styled(BondPreview)`
  width: ${preview.widthForBond}px;
  height: ${preview.heightForBond}px;
`;

export default StyledPreview;
