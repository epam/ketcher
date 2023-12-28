import { Operation } from 'domain/entities/Operation';

export class DrawingEntitiesMergeOperation implements Operation {
  constructor(
    private drawingEntitiesMergeChange: () => void,
    private invertDrawingEntitiesMergeChange: () => void,
  ) {}

  public execute() {
    this.drawingEntitiesMergeChange();
  }

  public invert() {
    this.invertDrawingEntitiesMergeChange();
  }
}
