import { IKetConnection } from 'application/formatters/types/ket';
import { CoreEditor } from 'application/editor';
import { Command } from 'domain/entities/Command';
import assert from 'assert';

export function polymerBondToDrawingEntity(connection: IKetConnection) {
  const editor = CoreEditor.provideEditorInstance();
  const command = new Command();
  const firstMonomer = editor.drawingEntitiesManager.monomers.get(
    Number(connection.endPoint1.monomerId),
  );
  const secondMonomer = editor.drawingEntitiesManager.monomers.get(
    Number(connection.endPoint2.monomerId),
  );

  assert(firstMonomer?.renderer);
  assert(secondMonomer?.renderer);
  const { command: bondAdditionCommand, polymerBond } =
    editor.drawingEntitiesManager.addPolymerBond(
      firstMonomer,
      firstMonomer.renderer.center,
      secondMonomer.renderer.center,
    );
  command.merge(bondAdditionCommand);
  command.merge(
    editor.drawingEntitiesManager.finishPolymerBondCreation(
      polymerBond,
      secondMonomer,
      connection.endPoint1.attachmentPointId,
      connection.endPoint2.attachmentPointId,
    ),
  );
  return command;
}
