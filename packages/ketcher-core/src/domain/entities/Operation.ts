import type { RenderersManager } from 'application/render/renderers/RenderersManager';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import type { PolymerBond } from 'domain/entities/PolymerBond';
import type { Atom } from 'domain/entities/CoreAtom';
import type { Bond } from 'domain/entities/CoreBond';
import type { MonomerToAtomBond } from 'domain/entities/MonomerToAtomBond';
import type { RxnArrow } from 'domain/entities/CoreRxnArrow';
import type { MultitailArrow } from 'domain/entities/CoreMultitailArrow';
import type { RxnPlus } from 'domain/entities/CoreRxnPlus';
import type { SGroupDrawingEntity } from 'domain/entities/SGroupDrawingEntity';

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
