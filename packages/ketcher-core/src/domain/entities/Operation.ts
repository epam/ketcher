import { RenderersManager } from 'application/render/renderers/RenderersManager';
import { BaseMonomer } from 'domain/entities/BaseMonomer';

export interface Operation {
  monomer?: BaseMonomer;
  execute(renderersManager: RenderersManager): void;
  invert(renderersManager: RenderersManager): void;
}
