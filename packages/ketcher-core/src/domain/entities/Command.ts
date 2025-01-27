import { Operation } from 'domain/entities/Operation';
import { RenderersManager } from 'application/render/renderers/RenderersManager';

export class Command {
  public operations: Operation[] = [];
  private undoOperationReverse = false;
  private setUndoOperationByPriority = false;

  private static objCounter = -1;
  private objId = ++Command.objCounter;

  private toLog(): string {
    return `${this.constructor.name}<${this.objId}>`;
  }

  public addOperation(operation: Operation) {
    this.operations.push(operation);
  }

  public merge(command: Command) {
    this.operations = [...this.operations, ...command.operations];
    this.setUndoOperationByPriority = command.setUndoOperationByPriority;
  }

  public setUndoOperationReverse() {
    // this method marks command that operations should be invoked in opposite sequence during invert()
    this.undoOperationReverse = true;
  }

  public setUndoOperationsByPriority() {
    this.setUndoOperationByPriority = true;
  }

  public invert(renderersManagers: RenderersManager) {
    const operations = this.undoOperationReverse
      ? this.operations.slice().reverse()
      : [...this.operations];

    if (this.setUndoOperationByPriority) {
      operations.sort((a, b) => (a.priority || 0) - (b.priority || 0));
    }

    operations.forEach((operation) => operation.invert(renderersManagers));
    renderersManagers.reinitializeViewModel();
    this.invertAfterAllOperations(renderersManagers, operations);
    renderersManagers.runPostRenderMethods();
  }

  public execute(renderersManagers: RenderersManager) {
    console.debug(
      `${this.toLog()}, execute(), start, ` +
        `this.operations: ${this.operationsToString()}`,
    );

    this.operations.forEach((operation) =>
      operation.execute(renderersManagers),
    );
    renderersManagers.reinitializeViewModel();
    this.executeAfterAllOperations(renderersManagers);
    renderersManagers.runPostRenderMethods();
  }

  private operationsToString(): string {
    return this.operations.length === 0
      ? '[]'
      : `\n${this.operations
          .map((o) => `  ${o.constructor.name}`)
          .join('\n')}\n`;
  }

  public executeAfterAllOperations(
    renderersManagers: RenderersManager,
    operations = this.operations,
  ) {
    operations.forEach((operation) => {
      if (operation.executeAfterAllOperations) {
        operation.executeAfterAllOperations(renderersManagers);
      }
    });
  }

  public invertAfterAllOperations(
    renderersManagers: RenderersManager,
    operations = this.operations,
  ) {
    operations.forEach((operation) => {
      if (operation.invertAfterAllOperations) {
        operation.invertAfterAllOperations(renderersManagers);
      }
    });
  }

  public clear() {
    this.operations = [];
  }
}
