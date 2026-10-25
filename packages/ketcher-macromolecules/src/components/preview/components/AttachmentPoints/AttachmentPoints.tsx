import {
  AttachmentPoint,
  AttachmentPointID,
  AttachmentPointLabel,
  AttachmentPointsList,
} from './AttachmentPoints.styles';
import { PreparedAttachmentPointData } from '../../hooks/useAttachmentPoints';

type Properties = {
  preparedAttachmentPointsData: PreparedAttachmentPointData[];
};

const AttachmentPoints = ({ preparedAttachmentPointsData }: Properties) => {
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
};

export default AttachmentPoints;
