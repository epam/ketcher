import { Operation } from 'domain/entities/Operation';
import { RenderersManager } from 'application/render/renderers/RenderersManager';

export class Command {
  public operations: Operation[] = [];
  private undoOperationReverse = false;

  public addOperation(operation: Operation) {
    this.operations.push(operation);
  }

  public merge(command: Command) {
    this.operations = [...this.operations, ...command.operations];
  }

  public setUndoOperationReverse() {
    // this method marks command that operations should be invoked in opposite sequence during invert()
    this.undoOperationReverse = true;
  }

  public invert(renderersManagers: RenderersManager) {
    const operations = this.undoOperationReverse
      ? this.operations.slice().reverse()
      : this.operations;
    operations.forEach((operation) => operation.invert(renderersManagers));
    renderersManagers.runPostRenderMethods();
  }

  public execute(renderersManagers: RenderersManager) {
    this.operations.forEach((operation) =>
      operation.execute(renderersManagers),
    );
    renderersManagers.runPostRenderMethods();
  }
}
