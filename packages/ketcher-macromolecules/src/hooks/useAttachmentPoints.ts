import { AttachmentPointName, MonomerItemType } from 'ketcher-core';
import { useMemo } from 'react';
import hydrateLeavingGroup from 'helpers/hydrateLeavingGroup';

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

      const preparedData: PreparedAttachmentPointData = {
        id,
        label: hydrateLeavingGroup(label),
        connected,
      };

      preparedAttachmentPointsData.push(preparedData);
    });

    return { preparedAttachmentPointsData, connectedAttachmentPoints };
  }, [monomer, attachmentPointsToBonds]);
};
