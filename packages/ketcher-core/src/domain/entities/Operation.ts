import type { RenderersManager } from 'application/render/renderers/RenderersManager';
import type { BaseMonomer } from './BaseMonomer';
import type { PolymerBond } from './PolymerBond';
import type { Atom } from './CoreAtom';
import type { Bond } from './CoreBond';
import type { MonomerToAtomBond } from './MonomerToAtomBond';
import type { RxnArrow } from './CoreRxnArrow';
import type { MultitailArrow } from './CoreMultitailArrow';
import type { RxnPlus } from './CoreRxnPlus';
import type { SGroupDrawingEntity } from './SGroupDrawingEntity';

export interface Operation {
  priority?: number;
  monomer?: BaseMonomer;
  atom?: Atom;
  bond?: Bond;
  monomerToAtomBond?: MonomerToAtomBond;
  polymerBond?: PolymerBond;
  rxnArrow?: RxnArrow;
  multitailArrow?: MultitailArrow;
  rxnPlus?: RxnPlus;
  sgroupDrawingEntity?: SGroupDrawingEntity;
  execute(renderersManager: RenderersManager): void;
  invert(renderersManager: RenderersManager): void;
  executeAfterAllOperations?(renderersManager: RenderersManager): void;
  invertAfterAllOperations?(renderersManager: RenderersManager): void;
}
