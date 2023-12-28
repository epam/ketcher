import { Operation } from 'domain/entities/Operation';
import { RenderersManager } from 'application/render/renderers/RenderersManager';
import { DrawingEntitiesMergeOperation } from 'application/editor/operations/drawingEntities';

export class Command {
  public operations: Operation[] = [];

  public addOperation(operation: Operation) {
    this.operations.push(operation);
  }

  public merge(command: Command) {
    this.operations = [...this.operations, ...command.operations];
  }

  public invert(renderersManagers: RenderersManager) {
    // move DrawingEntitiesMergeOperation to first because need to execute it before all the monomers and polmerBonds get removed
    let drawingEntitiesMergeOperation: Operation[] = [];
    this.operations.forEach((operation, index) => {
      if (operation instanceof DrawingEntitiesMergeOperation) {
        drawingEntitiesMergeOperation = this.operations.splice(index, 1);
      }
    });
    if (drawingEntitiesMergeOperation[0])
      this.operations.unshift(drawingEntitiesMergeOperation[0]);

    this.operations.forEach((operation) => operation.invert(renderersManagers));
    renderersManagers.runPostRenderMethods();
  }

  public execute(renderersManagers: RenderersManager) {
    // move DrawingEntitiesMergeOperation to first because need to wait until all the monomers and polmerBonds get created
    let drawingEntitiesMergeOperation: Operation[] = [];
    this.operations.forEach((operation, index) => {
      if (operation instanceof DrawingEntitiesMergeOperation) {
        drawingEntitiesMergeOperation = this.operations.splice(index, 1);
      }
    });
    if (drawingEntitiesMergeOperation[0])
      this.operations.push(drawingEntitiesMergeOperation[0]);

    this.operations.forEach((operation) =>
      operation.execute(renderersManagers),
    );
    renderersManagers.runPostRenderMethods();
  }
}
