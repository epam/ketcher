import { Operation } from 'domain/entities/Operation';

export class Command {
  public operations: Operation[] = [];

  public addOperation(operation: Operation) {
    this.operations.push(operation);
  }

  public merge(command: Command) {
    this.operations = [...this.operations, ...command.operations];
  }
}
