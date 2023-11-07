import { RenderersManager } from 'application/render/renderers/RenderersManager';

export interface Operation {
  execute(renderersManager: RenderersManager): void;
  invert(renderersManager: RenderersManager): void;
}
