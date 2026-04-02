import { Operation } from 'domain/entities/Operation';
import { RenderersManagerBase } from 'application/render/renderers/RenderersManagerBase';

export class RecalculateCanvasMatrixOperation implements Operation {
  public priority = 1;
  constructor(
    private readonly recalculateCanvasMatrixModelChange: () => void,
    private readonly invertRecalculateCanvasMatrixModelChange: () => void,
  ) {}

  public execute(renderersManager: RenderersManagerBase) {
    this.recalculateCanvasMatrixModelChange();
    renderersManager.rerenderSideConnectionPolymerBonds();
  }

  public invert(renderersManager: RenderersManagerBase) {
    this.invertRecalculateCanvasMatrixModelChange();
    renderersManager.rerenderSideConnectionPolymerBonds();
  }
}
