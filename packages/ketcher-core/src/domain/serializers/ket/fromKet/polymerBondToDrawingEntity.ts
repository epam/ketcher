import { IKetConnection } from 'application/formatters/types/ket';
import { Command } from 'domain/entities/Command';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { getAttachmentPointLabel } from 'domain/helpers/attachmentPointCalculations';
import { BaseMonomer } from 'domain/entities';
import { AttachmentPointName } from 'domain/types';
import { CoreEditor } from 'application/editor';

export function polymerBondToDrawingEntity(
  connection: IKetConnection,
  drawingEntitiesManager: DrawingEntitiesManager,
  atomIdMap: Map<number, number>,
  superatomMonomerToUsedAttachmentPoint: Map<BaseMonomer, Set<string>>,
  firstMonomer: BaseMonomer,
  secondMonomer: BaseMonomer,
) {
  const command = new Command();

  const firstAttachmentPoint =
    connection.endpoint1.attachmentPointId ||
    getAttachmentPointLabel(
      firstMonomer.monomerItem.struct.sgroups
        .get(0)
        ?.getAttachmentPoints()
        .find(
          (attachmentPoint) =>
            attachmentPoint.atomId ===
              atomIdMap.get(Number(connection.endpoint1.atomId)) &&
            !superatomMonomerToUsedAttachmentPoint
              .get(firstMonomer)
              ?.has(
                getAttachmentPointLabel(
                  attachmentPoint.attachmentPointNumber as number,
                ),
              ),
        )?.attachmentPointNumber as number,
    );
  const secondAttachmentPoint =
    connection.endpoint2.attachmentPointId ||
    getAttachmentPointLabel(
      secondMonomer.monomerItem.struct.sgroups
        .get(0)
        ?.getAttachmentPoints()
        .find(
          (attachmentPoint) =>
            attachmentPoint.atomId ===
              atomIdMap.get(Number(connection.endpoint2.atomId)) &&
            !superatomMonomerToUsedAttachmentPoint
              .get(secondMonomer)
              ?.has(
                getAttachmentPointLabel(
                  attachmentPoint.attachmentPointNumber as number,
                ),
              ),
        )?.attachmentPointNumber as number,
    );

  if (
    !firstMonomer.isAttachmentPointExistAndFree(
      firstAttachmentPoint as AttachmentPointName,
    ) ||
    !secondMonomer.isAttachmentPointExistAndFree(
      secondAttachmentPoint as AttachmentPointName,
    )
  ) {
    const editor = CoreEditor.provideEditorInstance();
    editor.events.error.dispatch(
      'There is no free attachment point for bond creation.',
    );
    return new Command();
  }

  if (!superatomMonomerToUsedAttachmentPoint.get(firstMonomer)) {
    superatomMonomerToUsedAttachmentPoint.set(firstMonomer, new Set());
  }

  if (!superatomMonomerToUsedAttachmentPoint.get(secondMonomer)) {
    superatomMonomerToUsedAttachmentPoint.set(secondMonomer, new Set());
  }

  superatomMonomerToUsedAttachmentPoint
    .get(firstMonomer)
    ?.add(firstAttachmentPoint);
  superatomMonomerToUsedAttachmentPoint
    .get(secondMonomer)
    ?.add(secondAttachmentPoint);

  command.merge(
    drawingEntitiesManager.createPolymerBond(
      firstMonomer,
      secondMonomer,
      firstAttachmentPoint as AttachmentPointName,
      secondAttachmentPoint as AttachmentPointName,
    ),
  );
  return command;
}
