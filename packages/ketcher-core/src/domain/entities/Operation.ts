import { RenderersManagerBase } from 'application/render/renderers/RenderersManagerBase';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { Atom } from 'domain/entities/CoreAtom';
import { Bond } from 'domain/entities/CoreBond';
import { MonomerToAtomBond } from 'domain/entities/MonomerToAtomBond';
import { RxnArrow } from 'domain/entities/CoreRxnArrow';
import { MultitailArrow } from 'domain/entities/CoreMultitailArrow';
import { RxnPlus } from 'domain/entities/CoreRxnPlus';

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
  execute(renderersManager: RenderersManagerBase): void;
  invert(renderersManager: RenderersManagerBase): void;
  executeAfterAllOperations?(renderersManager: RenderersManagerBase): void;
  invertAfterAllOperations?(renderersManager: RenderersManagerBase): void;
}
