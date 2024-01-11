import { Operation } from 'domain/entities/Operation';
import { RenderersManager } from 'application/render/renderers/RenderersManager';

export class Command {
  public operations: Operation[] = [];

  public addOperation(operation: Operation) {
    this.operations.push(operation);
  }

  public merge(command: Command) {
    this.operations = [...this.operations, ...command.operations];
  }

  public invert(renderersManagers: RenderersManager) {
    this.operations.forEach((operation) => operation.invert(renderersManagers));
    renderersManagers.runPostRenderMethods();
  }

  public execute(renderersManagers: RenderersManager) {
    this.operations.forEach((operation) =>
      operation.execute(renderersManagers),
    );
    renderersManagers.runPostRenderMethods();
  }
}
