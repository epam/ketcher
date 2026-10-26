import { AttachmentPointName, AttachmentPointsToBonds } from 'ketcher-core';
import { useMemo } from 'react';

type Props = {
  monomerCaps: Partial<Record<AttachmentPointName, string>> | undefined;
  attachmentPointsToBonds: AttachmentPointsToBonds | undefined;
};

export type PreparedAttachmentPointData = {
  id: string;
  label: string;
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

    const hasCaps = monomerCaps && Object.keys(monomerCaps).length > 0;

    if (!hasCaps) {
      if (!attachmentPointsToBonds) {
        return { preparedAttachmentPointsData, connectedAttachmentPoints };
      }

      Object.keys(attachmentPointsToBonds).forEach((id) => {
        const bond = attachmentPointsToBonds[id as AttachmentPointName];
        const connected = Boolean(bond);

        if (connected) {
          connectedAttachmentPoints.push(id);
        }

        preparedAttachmentPointsData.push({ id, label: '', connected });
      });

      return { preparedAttachmentPointsData, connectedAttachmentPoints };
    }

    Object.entries(monomerCaps).forEach(([id, label]) => {
      const bond = attachmentPointsToBonds?.[id];
      const connected = Boolean(bond);

      if (connected) {
        connectedAttachmentPoints.push(id);
      }

      const preparedData: PreparedAttachmentPointData = {
        id,
        label,
        connected,
      };

      preparedAttachmentPointsData.push(preparedData);
    });

    return { preparedAttachmentPointsData, connectedAttachmentPoints };
  }, [monomerCaps, attachmentPointsToBonds]);
};
