import { IKetConnection } from 'application/formatters/types/ket';
import { Command } from 'domain/entities/Command';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { Scale } from 'domain/helpers';
import { provideEditorSettings } from 'application/editor/editorSettings';
import { Vec2 } from 'domain/entities';

export function polymerBondToDrawingEntity(
  connection: IKetConnection,
  drawingEntitiesManager: DrawingEntitiesManager,
) {
  const command = new Command();
  const firstMonomer = drawingEntitiesManager.monomers.get(
    Number(connection.endPoint1.monomerId),
  );
  const secondMonomer = drawingEntitiesManager.monomers.get(
    Number(connection.endPoint2.monomerId),
  );

  const { command: bondAdditionCommand, polymerBond } =
    drawingEntitiesManager.addPolymerBond(
      firstMonomer,
      firstMonomer?.position,
      secondMonomer?.position,
    );
  command.merge(bondAdditionCommand);
  command.merge(
    drawingEntitiesManager.finishPolymerBondCreation(
      polymerBond,
      secondMonomer,
      connection.endPoint1.attachmentPointId,
      connection.endPoint2.attachmentPointId,
    ),
  );
  return command;
}
