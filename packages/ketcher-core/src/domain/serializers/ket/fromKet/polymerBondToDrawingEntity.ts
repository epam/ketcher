import { IKetConnection } from 'application/formatters/types/ket';
import { Command } from 'domain/entities/Command';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import assert from 'assert';
import { getAttachmentPointLabel } from 'domain/helpers/attachmentPointCalculations';

export function polymerBondToDrawingEntity(
  connection: IKetConnection,
  drawingEntitiesManager: DrawingEntitiesManager,
  monomerIdsMap: { [monomerIdFromKet: string]: number },
  atomIdMap: Map<number, number>,
) {
  const command = new Command();
  const firstMonomer = drawingEntitiesManager.monomers.get(
    Number(
      monomerIdsMap[
        connection.endpoint1.monomerId || connection.endpoint1.moleculeId
      ],
    ),
  );
  const secondMonomer = drawingEntitiesManager.monomers.get(
    Number(
      monomerIdsMap[
        connection.endpoint2.monomerId || connection.endpoint2.moleculeId
      ],
    ),
  );
  assert(firstMonomer);
  assert(secondMonomer);
  command.merge(
    drawingEntitiesManager.createPolymerBond(
      firstMonomer,
      secondMonomer,
      connection.endpoint1.attachmentPointId ||
        getAttachmentPointLabel(
          (firstMonomer.monomerItem.struct.sgroups
            .get(0)
            ?.getAttachmentPoints()
            .findIndex(
              (attachmentPoint) =>
                attachmentPoint.atomId ===
                atomIdMap.get(connection.endpoint1.atomId),
            ) as number) + 1,
        ),
      connection.endpoint2.attachmentPointId ||
        getAttachmentPointLabel(
          (secondMonomer.monomerItem.struct.sgroups
            .get(0)
            ?.getAttachmentPoints()
            .findIndex(
              (attachmentPoint) =>
                attachmentPoint.atomId ===
                atomIdMap.get(connection.endpoint2.atomId),
            ) as number) + 1,
        ),
    ),
  );
  return command;
}
