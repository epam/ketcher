import { PreparedAttachmentPointData } from 'components/preview/hooks/useAttachmentPoints';
import {
  AttachmentPoint,
  AttachmentPointName,
  LeavingGroup,
} from './BondAttachmentPoints.styles';

interface Props {
  attachmentPoints: PreparedAttachmentPointData[];
  attachmentPointInBond: string | undefined;
}

const BondAttachmentPoints = ({
  attachmentPoints,
  attachmentPointInBond,
}: Props) => {
  return (
    <>
      {attachmentPoints.map((attachmentPoint) => {
        const isInBond = attachmentPoint.id === attachmentPointInBond;

        return (
          <AttachmentPoint
            connected={attachmentPoint.connected}
            inBond={isInBond}
            key={attachmentPoint.id}
          >
            <AttachmentPointName>{attachmentPoint.id}</AttachmentPointName>
            {(attachmentPoint.label || isInBond) && (
              <LeavingGroup inBond={isInBond}>
                {attachmentPoint.label}
              </LeavingGroup>
            )}
          </AttachmentPoint>
        );
      })}
    </>
  );
};

export default BondAttachmentPoints;
