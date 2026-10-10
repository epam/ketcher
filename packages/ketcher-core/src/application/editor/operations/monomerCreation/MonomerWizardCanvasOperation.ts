import type { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import type { Operation } from 'domain/entities/Operation';

export class MonomerWizardCanvasOperation implements Operation {
  constructor(
    private readonly previousCanvas: DrawingEntitiesManager,
    private readonly nextCanvas: DrawingEntitiesManager,
    private readonly restoreCanvas: (canvas: DrawingEntitiesManager) => void,
  ) {}

  execute() {
    this.restoreCanvas(this.nextCanvas);
  }

  invert() {
    this.restoreCanvas(this.previousCanvas);
  }
}
