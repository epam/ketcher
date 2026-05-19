import { Bond } from 'ketcher-core';

import {
  findBondBetweenRnaPresetComponents,
  getRnaPresetComponentKeysToSave,
  isValidRnaPresetStructure,
  RnaPresetComponentStructures,
  RnaPresetValidationStruct,
} from './RnaPresetStructureValidation';

const createWizardStruct = (
  atomIds: number[],
  bonds: Array<Pick<Bond, 'begin' | 'end'>>,
): RnaPresetValidationStruct => ({
  atoms: new Map(atomIds.map((atomId) => [atomId, {}])),
  bonds: new Map(bonds.map((bond, bondId) => [bondId, bond])),
});

const createRnaPresetWizardState = ({
  sugar,
  base = [],
  phosphate = [],
}: {
  sugar: number[];
  base?: number[];
  phosphate?: number[];
}): RnaPresetComponentStructures => ({
  sugar: {
    structure: {
      atoms: sugar,
      bonds: [],
    },
  },
  base: {
    structure: {
      atoms: base,
      bonds: [],
    },
  },
  phosphate: {
    structure: {
      atoms: phosphate,
      bonds: [],
    },
  },
});

describe('isValidRnaPresetStructure', () => {
  it.each([
    {
      name: 'sugar and base preset',
      atomIds: [0, 1, 2],
      bonds: [
        { begin: 0, end: 1 },
        { begin: 1, end: 2 },
      ],
      components: createRnaPresetWizardState({
        sugar: [1, 2],
        base: [0],
      }),
      expected: true,
    },
    {
      name: 'sugar and phosphate preset',
      atomIds: [0, 1, 2],
      bonds: [
        { begin: 0, end: 1 },
        { begin: 1, end: 2 },
      ],
      components: createRnaPresetWizardState({
        sugar: [0, 1],
        phosphate: [2],
      }),
      expected: true,
    },
    {
      name: 'sugar, base, and phosphate preset',
      atomIds: [0, 1, 2, 3],
      bonds: [
        { begin: 0, end: 1 },
        { begin: 1, end: 2 },
        { begin: 2, end: 3 },
      ],
      components: createRnaPresetWizardState({
        sugar: [1, 2],
        base: [0],
        phosphate: [3],
      }),
      expected: true,
    },
    {
      name: 'preset without sugar',
      atomIds: [0, 1],
      bonds: [{ begin: 0, end: 1 }],
      components: createRnaPresetWizardState({
        sugar: [],
        base: [0],
        phosphate: [1],
      }),
      expected: false,
    },
    {
      name: 'base directly bonded to phosphate',
      atomIds: [0, 1, 2],
      bonds: [{ begin: 0, end: 2 }],
      components: createRnaPresetWizardState({
        sugar: [1],
        base: [0],
        phosphate: [2],
      }),
      expected: false,
    },
    {
      name: 'atoms outside selected components',
      atomIds: [0, 1, 2],
      bonds: [{ begin: 0, end: 1 }],
      components: createRnaPresetWizardState({
        sugar: [0],
        phosphate: [1],
      }),
      expected: false,
    },
    {
      name: 'same atom reused across components',
      atomIds: [0, 1],
      bonds: [{ begin: 0, end: 1 }],
      components: createRnaPresetWizardState({
        sugar: [0],
        base: [0],
      }),
      expected: false,
    },
  ])(
    'returns $expected for $name',
    ({ atomIds, bonds, components, expected }) => {
      expect(
        isValidRnaPresetStructure(
          createWizardStruct(atomIds, bonds),
          components,
        ),
      ).toBe(expected);
    },
  );
});

describe('getRnaPresetComponentKeysToSave', () => {
  it('returns only components that have a selected structure', () => {
    expect(
      getRnaPresetComponentKeysToSave(
        createRnaPresetWizardState({
          sugar: [0, 1],
          phosphate: [2],
        }),
      ),
    ).toEqual(['sugar', 'phosphate']);
  });
});

describe('findBondBetweenRnaPresetComponents', () => {
  it('returns undefined when one component is absent', () => {
    expect(
      findBondBetweenRnaPresetComponents(
        createWizardStruct([0, 1], [{ begin: 0, end: 1 }]),
        [0],
        [],
      ),
    ).toBeUndefined();
  });

  it('returns the bond between selected components when it exists', () => {
    expect(
      findBondBetweenRnaPresetComponents(
        createWizardStruct(
          [0, 1, 2],
          [
            { begin: 0, end: 1 },
            { begin: 1, end: 2 },
          ],
        ),
        [0, 1],
        [2],
      ),
    ).toEqual({ begin: 1, end: 2 });
  });
});
