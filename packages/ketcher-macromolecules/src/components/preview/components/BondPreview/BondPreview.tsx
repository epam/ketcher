import styled from '@emotion/styled';
import { useMemo } from 'react';
import { useAppSelector } from 'hooks';
import { BondPreviewState, selectShowPreview } from 'state/common';
import ConnectionOverview from 'components/shared/ConnectionOverview/ConnectionOverview';
import MonomerOverview from 'components/shared/ConnectionOverview/components/MonomerOverview/MonomerOverview';
import { useAttachmentPoints } from '../../hooks/useAttachmentPoints';
import { Container } from './BondPreview.styles';
import BondAttachmentPoints from 'components/preview/components/BondAttachmentPoints/BondAttachmentPoints';

interface Props {
  className?: string;
}

const BondPreview = ({ className }: Props) => {
  const preview = useAppSelector(selectShowPreview) as BondPreviewState;

  const { polymerBond, style } = preview;

  const ContainerDynamic = useMemo(() => {
    if (!style) {
      return styled(Container)``;
    }

    return styled(Container)`
      top: ${style?.top || ''};
      left: ${style?.left || ''};
      right: ${style?.right || ''};
    `;
  }, [style]);

  const {
    firstMonomer,
    secondMonomer,
    firstMonomerAttachmentPoint,
    secondMonomerAttachmentPoint,
  } = polymerBond;

  const {
    preparedAttachmentPointsData: firstMonomerPreparedAPsData,
    connectedAttachmentPoints: firstMonomerConnectedAPs,
  } = useAttachmentPoints({
    monomer: firstMonomer.monomerItem,
    attachmentPointsToBonds: firstMonomer.attachmentPointsToBonds,
  });

  const {
    preparedAttachmentPointsData: secondMonomerPreparedAPsData,
    connectedAttachmentPoints: secondMonomerConnectedAPs,
  } = useAttachmentPoints({
    monomer: secondMonomer?.monomerItem,
    attachmentPointsToBonds: secondMonomer?.attachmentPointsToBonds,
  });

  if (!firstMonomer || !secondMonomer) {
    return null;
  }

  return (
    <ContainerDynamic className={className}>
      <ConnectionOverview
        firstMonomer={firstMonomer}
        secondMonomer={secondMonomer}
        firstMonomerOverview={
          <MonomerOverview
            monomer={firstMonomer}
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
    </ContainerDynamic>
  );
};

const StyledPreview = styled(BondPreview)`
  z-index: 5;
  position: absolute;
  width: 358px;
  height: 268px;
  transform: translate(-50%, 0);
`;

export default StyledPreview;
