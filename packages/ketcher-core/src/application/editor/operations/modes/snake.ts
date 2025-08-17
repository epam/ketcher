import { Operation } from 'domain/entities/Operation';
import { RenderersManager } from 'application/render/renderers/RenderersManager';

export class RecalculateCanvasMatrixOperation implements Operation {
  public priority = 1;
  constructor(
    private readonly recalculateCanvasMatrixModelChange: () => void,
    private readonly invertRecalculateCanvasMatrixModelChange: () => void,
  ) {}

  public execute(renderersManager: RenderersManager) {
    this.recalculateCanvasMatrixModelChange();
    renderersManager.rerenderSideConnectionPolymerBonds();
  }

  public invert(renderersManager: RenderersManager) {
    this.invertRecalculateCanvasMatrixModelChange();
    renderersManager.rerenderSideConnectionPolymerBonds();
  }
}
