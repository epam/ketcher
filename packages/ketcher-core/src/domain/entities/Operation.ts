import { RenderersManager } from 'application/render/renderers/RenderersManager';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { PolymerBond } from 'domain/entities/PolymerBond';

export interface Operation {
  priority?: number;
  monomer?: BaseMonomer;
  polymerBond?: PolymerBond;
  execute(renderersManager: RenderersManager): void;
  invert(renderersManager: RenderersManager): void;
}
