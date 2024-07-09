import { Operation } from 'domain/entities/Operation';
import { RenderersManager } from 'application/render/renderers/RenderersManager';

export class RecalculateCanvasMatrixOperation implements Operation {
  constructor(
    private recalculateCanvasMatrixModelChange: () => void,
    private invertRecalculateCanvasMatrixModelChange: () => void,
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
