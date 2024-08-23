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
      {attachmentPoints.map((attachmentPoint) => (
        <AttachmentPoint
          connected={attachmentPoint.connected}
          inBond={attachmentPoint.id === attachmentPointInBond}
          key={attachmentPoint.id}
        >
          <AttachmentPointName>{attachmentPoint.id}</AttachmentPointName>
          <LeavingGroup inBond={attachmentPoint.id === attachmentPointInBond}>
            {attachmentPoint.label}
          </LeavingGroup>
        </AttachmentPoint>
      ))}
    </>
  );
};

export default BondAttachmentPoints;
