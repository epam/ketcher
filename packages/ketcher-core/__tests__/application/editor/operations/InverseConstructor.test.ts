import {
  AlignDescriptors,
  AtomAdd,
  AtomDelete,
  BondAdd,
  BondDelete,
  FragmentAdd,
  FragmentAddStereoAtom,
  FragmentDelete,
  FragmentDeleteStereoAtom,
  RestoreDescriptorsPosition,
  RestoreIfThen,
  UpdateIfThen,
} from 'application/editor/operations';

type OperationConstructor = {
  InverseConstructor: unknown;
};

describe('operation inverse constructors', () => {
  it.each<[string, OperationConstructor, unknown]>([
    ['AlignDescriptors', AlignDescriptors, RestoreDescriptorsPosition],
    [
      'RestoreDescriptorsPosition',
      RestoreDescriptorsPosition,
      AlignDescriptors,
    ],
    ['FragmentAdd', FragmentAdd, FragmentDelete],
    ['FragmentDelete', FragmentDelete, FragmentAdd],
    ['FragmentAddStereoAtom', FragmentAddStereoAtom, FragmentDeleteStereoAtom],
    [
      'FragmentDeleteStereoAtom',
      FragmentDeleteStereoAtom,
      FragmentAddStereoAtom,
    ],
    ['RestoreIfThen', RestoreIfThen, UpdateIfThen],
    ['UpdateIfThen', UpdateIfThen, RestoreIfThen],
    ['AtomAdd', AtomAdd, AtomDelete],
    ['AtomDelete', AtomDelete, AtomAdd],
    ['BondAdd', BondAdd, BondDelete],
    ['BondDelete', BondDelete, BondAdd],
  ])('%s exposes a read-only inverse constructor', (_, operation, inverse) => {
    expect(operation.InverseConstructor).toBe(inverse);

    const descriptor = Object.getOwnPropertyDescriptor(
      operation,
      'InverseConstructor',
    );

    expect(descriptor?.get).toBeDefined();
    expect(descriptor?.set).toBeUndefined();
  });
});
