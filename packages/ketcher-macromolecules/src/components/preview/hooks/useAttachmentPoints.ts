import {
  AttachmentPointName,
  AttachmentPointsToBonds,
  LeavingGroup,
} from 'ketcher-core';
import { useMemo } from 'react';
import hydrateLeavingGroup from 'helpers/hydrateLeavingGroup';

type Props = {
  monomerCaps: Partial<Record<AttachmentPointName, string>> | undefined;
  attachmentPointsToBonds: AttachmentPointsToBonds | undefined;
};

export type PreparedAttachmentPointData = {
  id: string;
  label: LeavingGroup;
  connected: boolean;
};

type ReturnType = {
  preparedAttachmentPointsData: PreparedAttachmentPointData[];
  connectedAttachmentPoints: string[];
};

export const useAttachmentPoints = ({
  monomerCaps,
  attachmentPointsToBonds,
}: Props): ReturnType => {
  return useMemo(() => {
    const preparedAttachmentPointsData: PreparedAttachmentPointData[] = [];
    const connectedAttachmentPoints: string[] = [];

    if (!monomerCaps) {
      return { preparedAttachmentPointsData, connectedAttachmentPoints };
    }

    Object.entries(monomerCaps).forEach(([id, label]) => {
      const connected = Boolean(attachmentPointsToBonds?.[id]);

      if (connected) {
        connectedAttachmentPoints.push(id);
      }

      const preparedData: PreparedAttachmentPointData = {
        id,
        label: hydrateLeavingGroup(label as LeavingGroup),
        connected,
      };

      preparedAttachmentPointsData.push(preparedData);
    });

    return { preparedAttachmentPointsData, connectedAttachmentPoints };
  }, [monomerCaps, attachmentPointsToBonds]);
};
