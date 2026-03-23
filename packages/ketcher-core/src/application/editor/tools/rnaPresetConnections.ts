import {
  IKetTemplateConnection,
  KetConnectionType,
} from 'application/formatters';
import {
  IRnaPreset,
  RnaPhosphatePosition,
} from 'application/editor/tools/Tool';
import { AttachmentPointName } from 'domain/types';
import {
  setAmbiguousMonomerTemplatePrefix,
  setMonomerTemplatePrefix,
} from 'domain/serializers';

const getMonomerTemplateId = (monomer: IRnaPreset['base']) => {
  const templateId =
    monomer?.props?.id || (monomer as { id?: string } | undefined)?.id;

  if (!templateId) {
    return undefined;
  }

  const isAmbiguousMonomer = Boolean(monomer?.isAmbiguous);

  return isAmbiguousMonomer
    ? setAmbiguousMonomerTemplatePrefix(templateId)
    : setMonomerTemplatePrefix(templateId);
};

const isSugarPhosphateConnection = (
  connection: IKetTemplateConnection,
  sugarTemplateId?: string,
  phosphateTemplateId?: string,
) => {
  const endpointIds = [
    connection.endpoint1.monomerTemplateId,
    connection.endpoint2.monomerTemplateId,
  ];

  if (sugarTemplateId && phosphateTemplateId) {
    return (
      endpointIds.includes(sugarTemplateId) &&
      endpointIds.includes(phosphateTemplateId)
    );
  }

  const endpointAttachmentPoints = [
    connection.endpoint1.attachmentPointId,
    connection.endpoint2.attachmentPointId,
  ];

  return (
    !endpointAttachmentPoints.includes(AttachmentPointName.R3) &&
    endpointAttachmentPoints.includes(AttachmentPointName.R1) &&
    endpointAttachmentPoints.includes(AttachmentPointName.R2)
  );
};

export const getRnaPresetPhosphatePosition = (
  preset: Pick<IRnaPreset, 'sugar' | 'phosphate' | 'connections'>,
): RnaPhosphatePosition | undefined => {
  if (!preset?.phosphate) {
    return undefined;
  }

  const sugarTemplateId = getMonomerTemplateId(preset.sugar);
  const phosphateTemplateId = getMonomerTemplateId(preset.phosphate);
  const sugarPhosphateConnection = preset.connections?.find((connection) =>
    isSugarPhosphateConnection(
      connection,
      sugarTemplateId,
      phosphateTemplateId,
    ),
  );

  if (!sugarPhosphateConnection) {
    // Older presets and sequence-mode presets are stored without an explicit
    // sugar-phosphate template connection for the 3' case, so right-side
    // phosphate remains the backward-compatible default.
    return 'right';
  }

  const sugarEndpoint =
    !sugarTemplateId ||
    sugarPhosphateConnection.endpoint1.monomerTemplateId === sugarTemplateId
      ? sugarPhosphateConnection.endpoint1
      : sugarPhosphateConnection.endpoint2;

  return sugarEndpoint.attachmentPointId === AttachmentPointName.R1
    ? 'left'
    : 'right';
};

export const buildRnaPresetConnections = (
  preset: Pick<IRnaPreset, 'base' | 'sugar' | 'phosphate'>,
  phosphatePosition?: RnaPhosphatePosition,
): IKetTemplateConnection[] => {
  const baseTemplateId = getMonomerTemplateId(preset.base);
  const sugarTemplateId = getMonomerTemplateId(preset.sugar);
  const phosphateTemplateId = getMonomerTemplateId(preset.phosphate);
  const connections: IKetTemplateConnection[] = [];

  if (baseTemplateId && sugarTemplateId) {
    connections.push({
      connectionType: KetConnectionType.SINGLE,
      endpoint1: {
        monomerTemplateId: baseTemplateId,
        attachmentPointId: AttachmentPointName.R1,
      },
      endpoint2: {
        monomerTemplateId: sugarTemplateId,
        attachmentPointId: AttachmentPointName.R3,
      },
    });
  }

  if (sugarTemplateId && phosphateTemplateId) {
    connections.push({
      connectionType: KetConnectionType.SINGLE,
      endpoint1: {
        monomerTemplateId: sugarTemplateId,
        attachmentPointId:
          phosphatePosition === 'left'
            ? AttachmentPointName.R1
            : AttachmentPointName.R2,
      },
      endpoint2: {
        monomerTemplateId: phosphateTemplateId,
        attachmentPointId:
          phosphatePosition === 'left'
            ? AttachmentPointName.R2
            : AttachmentPointName.R1,
      },
    });
  }

  return connections;
};
