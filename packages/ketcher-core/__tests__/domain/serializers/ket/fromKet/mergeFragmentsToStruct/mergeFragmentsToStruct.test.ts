import { Struct } from 'domain/entities';
import { KetItem } from 'domain/serializers/ket/fromKet/types';
import {
  atomToStruct,
  bondToStruct,
} from 'domain/serializers/ket/fromKet/moleculeToStruct';
import { mergeFragmentsToStruct } from 'domain/serializers/ket/fromKet/mergeFragmentsToStruct';

describe('mergeFragmentsToStruct', () => {
  it('should return the same struct when ketItem is empty', () => {
    const emptyKetItem: KetItem = {};
    const struct: Struct = new Struct();
    const result = mergeFragmentsToStruct(emptyKetItem, struct);

    expect(result.atoms).toEqual(struct.atoms);
    expect(result.bonds).toEqual(struct.bonds);
  });

  it('should merge single fragment into struct', () => {
    const singleFragmentKetItem: KetItem = {
      fragments: [
        {
          atoms: [
            {
              attachmentPoints: 1,
              label: 'C',
              location: [1, 2, 3],
            },
          ],
        },
      ],
    };

    const struct: Struct = new Struct();
    const expectedStruct = new Struct();
    expectedStruct.atoms.add(
      atomToStruct({
        attachmentPoints: 1,
        label: 'C',
        location: [1, 2, 3],
      }),
    );

    const result = mergeFragmentsToStruct(singleFragmentKetItem, struct);
    expect(result.atoms).toEqual(expectedStruct.atoms);
    expect(result.bonds).toEqual(expectedStruct.bonds);
  });

  it('should merge multiple fragments with no bonds into struct', () => {
    const multiFragmentKetItem: KetItem = {
      fragments: [
        {
          atoms: [
            {
              attachmentPoints: 1,
              label: 'C',
              location: [1, 2, 3],
            },
          ],
        },
        {
          atoms: [
            {
              attachmentPoints: 1,
              label: 'O',
              location: [4, 5, 6],
            },
          ],
        },
      ],
    };

    const struct = new Struct();
    const expectedStruct = new Struct();
    expectedStruct.atoms.add(
      atomToStruct({
        attachmentPoints: 1,
        label: 'C',
        location: [1, 2, 3],
      }),
    );
    expectedStruct.atoms.add(
      atomToStruct({
        attachmentPoints: 1,
        label: 'O',
        location: [4, 5, 6],
      }),
    );

    const result = mergeFragmentsToStruct(multiFragmentKetItem, struct);
    expect(result.atoms).toEqual(expectedStruct.atoms);
    expect(result.bonds).toEqual(expectedStruct.bonds);
  });

  it('should merge multiple fragments with bonds into struct', () => {
    const multiFragmentKetItem: KetItem = {
      fragments: [
        {
          atoms: [
            {
              attachmentPoints: 1,
              label: 'C',
              location: [1, 2, 3],
            },
            {
              attachmentPoints: 1,
              label: 'O',
              location: [4, 5, 6],
            },
          ],
          bonds: [
            {
              type: 1,
              atoms: [0, 1],
            },
          ],
        },
        {
          atoms: [
            {
              attachmentPoints: 1,
              label: 'N',
              location: [7, 8, 9],
            },
          ],
          bonds: [],
        },
      ],
    };

    const struct: Struct = new Struct();
    const expectedStruct = new Struct();
    const expectedAtoms = [
      {
        attachmentPoints: 1,
        label: 'C',
        location: [1, 2, 3],
      },
      {
        attachmentPoints: 1,
        label: 'O',
        location: [4, 5, 6],
      },
      {
        attachmentPoints: 1,
        label: 'N',
        location: [7, 8, 9],
      },
    ];
    expectedAtoms.forEach((atom) => {
      expectedStruct.atoms.add(atomToStruct(atom));
    });
    expectedStruct.bonds.add(
      bondToStruct({
        type: 1,
        atoms: [0, 1],
      }),
    );

    const result = mergeFragmentsToStruct(multiFragmentKetItem, struct);
    expect(result.atoms).toEqual(expectedStruct.atoms);
    expect(result.bonds).toEqual(expectedStruct.bonds);
  });
});
