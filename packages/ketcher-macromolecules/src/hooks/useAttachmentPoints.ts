import { AttachmentPointName, MonomerItemType } from 'ketcher-core';
import { useMemo } from 'react';

type Props = {
  monomer: MonomerItemType;
  attachmentPointsToBonds: Record<AttachmentPointName, unknown | null>;
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
  monomer,
  attachmentPointsToBonds,
}: Props): ReturnType => {
  return useMemo(() => {
    const preparedAttachmentPointsData: PreparedAttachmentPointData[] = [];
    const connectedAttachmentPoints: string[] = [];

    Object.entries(monomer?.props?.MonomerCaps ?? {}).forEach(([id, label]) => {
      const connected = Boolean(attachmentPointsToBonds?.[id]);

      if (connected) {
        connectedAttachmentPoints.push(id);
      }

      const labelToRender = label === 'O' ? 'OH' : label;

      const preparedData: PreparedAttachmentPointData = {
        id,
        label: labelToRender,
        connected,
      };

      preparedAttachmentPointsData.push(preparedData);
    });

    return { preparedAttachmentPointsData, connectedAttachmentPoints };
  }, [monomer, attachmentPointsToBonds]);
};
