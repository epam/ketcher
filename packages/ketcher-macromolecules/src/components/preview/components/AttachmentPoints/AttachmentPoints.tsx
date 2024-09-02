import { memo } from 'react';
import {
  AttachmentPoint,
  AttachmentPointID,
  AttachmentPointLabel,
  AttachmentPointsList,
} from './AttachmentPoints.styles';
import { PreparedAttachmentPointData } from '../../hooks/useAttachmentPoints';

type Props = {
  preparedAttachmentPointsData: PreparedAttachmentPointData[];
};

const AttachmentPoints = memo(({ preparedAttachmentPointsData }: Props) => {
  if (!preparedAttachmentPointsData.length) {
    return null;
  }

  return (
    <AttachmentPointsList>
      {preparedAttachmentPointsData.map(({ id, connected, label }) => (
        <AttachmentPoint key={id} connected={connected}>
          <AttachmentPointID>
            {id}
            {!connected && ':'}
          </AttachmentPointID>
          {!connected && <AttachmentPointLabel>{label}</AttachmentPointLabel>}
        </AttachmentPoint>
      ))}
    </AttachmentPointsList>
  );
});

export default AttachmentPoints;
