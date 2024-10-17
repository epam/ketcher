import { RenderersManager } from 'application/render/renderers/RenderersManager';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { Atom } from 'domain/entities/CoreAtom';
import { Bond } from 'domain/entities/CoreBond';
import { MonomerToAtomBond } from 'domain/entities/MonomerToAtomBond';

export interface Operation {
  priority?: number;
  monomer?: BaseMonomer;
  atom?: Atom;
  bond?: Bond;
  monomerToAtomBond?: MonomerToAtomBond;
  polymerBond?: PolymerBond;
  execute(renderersManager: RenderersManager): void;
  invert(renderersManager: RenderersManager): void;
  executeAfterAllOperations?(renderersManager: RenderersManager): void;
}
