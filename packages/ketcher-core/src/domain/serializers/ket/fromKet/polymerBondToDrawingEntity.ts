import { IKetConnection } from 'application/formatters/types/ket';
import { Command } from 'domain/entities/Command';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import assert from 'assert';

export function polymerBondToDrawingEntity(
  connection: IKetConnection,
  drawingEntitiesManager: DrawingEntitiesManager,
  monomerIdsMap: { [monomerIdFromKet: string]: number },
) {
  const command = new Command();
  // TODO remove assertion when group connections will be supported on indigo side
  assert(connection.endpoint1.monomerId);
  assert(connection.endpoint2.monomerId);
  const firstMonomer = drawingEntitiesManager.monomers.get(
    Number(monomerIdsMap[connection.endpoint1.monomerId]),
  );
  const secondMonomer = drawingEntitiesManager.monomers.get(
    Number(monomerIdsMap[connection.endpoint2.monomerId]),
  );

  assert(connection.endpoint1.attachmentPointId);
  assert(connection.endpoint2.attachmentPointId);
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
      connection.endpoint1.attachmentPointId,
      connection.endpoint2.attachmentPointId,
    ),
  );
  return command;
}
