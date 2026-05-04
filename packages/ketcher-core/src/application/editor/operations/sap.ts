import { ReStruct } from '../../render';

import { BaseOperation } from './BaseOperation';
import { OperationType } from './OperationType';
import { HapticBond } from 'domain/entities/HapticBond';
import { SuperAttachmentPoint } from 'domain/entities/superAttachmentPoint';

class SuperAPAdd extends BaseOperation {
  static InverseConstructor: new (sapId: number) => BaseOperation;
  sapId: number | null;
  readonly atomIds: number[];

  constructor(atomIds: number[], sapId?: number) {
    super(OperationType.SUPER_ATTACHMENT_POINT_ADD);
    this.atomIds = [...atomIds];
    this.sapId = sapId ?? null;
  }

  execute(restruct: ReStruct) {
    const struct = restruct.molecule;
    const sap = new SuperAttachmentPoint({ atoms: this.atomIds });
    sap.recomputeCenter(struct);
    if (this.sapId === null) {
      this.sapId = struct.superAttachmentPoints.add(sap);
    } else {
      struct.superAttachmentPoints.set(this.sapId, sap);
    }
  }

  invert() {
    return new SuperAPAdd.InverseConstructor(this.sapId as number);
  }
}

class SuperAPDelete extends BaseOperation {
  static InverseConstructor: new (
    atomIds: number[],
    sapId?: number,
  ) => BaseOperation;

  readonly sapId: number;
  capturedAtoms: number[] | null = null;

  constructor(sapId: number) {
    super(OperationType.SUPER_ATTACHMENT_POINT_DELETE, 100);
    this.sapId = sapId;
  }

  execute(restruct: ReStruct) {
    const struct = restruct.molecule;
    const sap = struct.superAttachmentPoints.get(this.sapId);
    if (!sap) return;
    this.capturedAtoms = [...sap.atoms];
    struct.superAttachmentPoints.delete(this.sapId);
  }

  invert() {
    return new SuperAPDelete.InverseConstructor(
      this.capturedAtoms ?? [],
      this.sapId,
    );
  }
}

class SuperAPAtomsChange extends BaseOperation {
  readonly sapId: number;
  readonly newAtoms: number[];
  private previousAtoms: number[] | null = null;

  constructor(sapId: number, newAtoms: number[]) {
    super(OperationType.SUPER_ATTACHMENT_POINT_ATOMS_CHANGE);
    this.sapId = sapId;
    this.newAtoms = [...newAtoms];
  }

  execute(restruct: ReStruct) {
    const struct = restruct.molecule;
    const sap = struct.superAttachmentPoints.get(this.sapId);
    if (!sap) return;
    this.previousAtoms = [...sap.atoms];
    sap.atoms = [...this.newAtoms];
    sap.recomputeCenter(struct);
  }

  invert() {
    return new SuperAPAtomsChange(this.sapId, this.previousAtoms ?? []);
  }
}

class HapticBondAdd extends BaseOperation {
  static InverseConstructor: new (bondId: number) => BaseOperation;
  bondId: number | null;
  readonly atomId: number;
  readonly sapId: number;

  constructor(atomId: number, sapId: number, bondId?: number) {
    super(OperationType.HAPTIC_BOND_ADD);
    this.atomId = atomId;
    this.sapId = sapId;
    this.bondId = bondId ?? null;
  }

  execute(restruct: ReStruct) {
    const struct = restruct.molecule;
    const bond = new HapticBond({ begin: this.atomId, sapId: this.sapId });
    if (this.bondId === null) {
      this.bondId = struct.bonds.add(bond);
    } else {
      struct.bonds.set(this.bondId, bond);
    }
  }

  invert() {
    return new HapticBondAdd.InverseConstructor(this.bondId as number);
  }
}

class HapticBondDelete extends BaseOperation {
  static InverseConstructor: new (
    atomId: number,
    sapId: number,
    bondId?: number,
  ) => BaseOperation;

  readonly bondId: number;
  capturedAtomId: number | null = null;
  capturedSapId: number | null = null;

  constructor(bondId: number) {
    super(OperationType.HAPTIC_BOND_DELETE, 100);
    this.bondId = bondId;
  }

  execute(restruct: ReStruct) {
    const struct = restruct.molecule;
    const bond = struct.bonds.get(this.bondId);
    if (!bond || !(bond instanceof HapticBond)) return;
    this.capturedAtomId = bond.begin;
    this.capturedSapId = bond.sapId;
    struct.bonds.delete(this.bondId);
  }

  invert() {
    return new HapticBondDelete.InverseConstructor(
      this.capturedAtomId ?? -1,
      this.capturedSapId ?? -1,
      this.bondId,
    );
  }
}

SuperAPAdd.InverseConstructor = SuperAPDelete;
SuperAPDelete.InverseConstructor = SuperAPAdd;
HapticBondAdd.InverseConstructor = HapticBondDelete;
HapticBondDelete.InverseConstructor = HapticBondAdd;

export {
  SuperAPAdd,
  SuperAPDelete,
  SuperAPAtomsChange,
  HapticBondAdd,
  HapticBondDelete,
};
