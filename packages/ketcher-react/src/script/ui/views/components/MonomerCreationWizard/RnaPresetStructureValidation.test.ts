import { Bond } from 'ketcher-core';

import {
  type RnaPresetComponentStructures,
  type RnaPresetValidationStruct,
  findBondBetweenRnaPresetComponents,
  getRnaPresetComponentKeysToSave,
  getRnaPresetStructureValidationResult,
  isValidRnaPresetStructure,
} from './RnaPresetStructureValidation';

const createWizardStruct = (
  atomIds: number[],
  bonds: Array<
    Pick<Bond, 'begin' | 'end'> & Partial<Pick<Bond, 'type' | 'stereo'>>
  >,
): RnaPresetValidationStruct => ({
  atoms: new Map(atomIds.map((atomId) => [atomId, {}])),
  bonds: new Map(bonds.map((bond, bondId) => [bondId, bond])),
});

describe('getRnaPresetStructureValidationResult', () => {
  it('returns an atom ownership error and highlights atoms outside components', () => {
    const result = getRnaPresetStructureValidationResult(
      createWizardStruct([0, 1, 2], [{ begin: 0, end: 1 }]),
      createRnaPresetWizardState({
        sugar: [0],
        phosphate: [1],
      }),
    );

    expect(result.issues).toContain('rnaPresetAtomsOutsideComponents');
    expect(result.problematicAtomIds).toEqual(new Set([2]));
  });

  it('returns an atom ownership warning and highlights atoms assigned to multiple components', () => {
    const result = getRnaPresetStructureValidationResult(
      createWizardStruct([0], []),
      createRnaPresetWizardState({
        sugar: [0],
        base: [0],
      }),
    );

    expect(result.issues).toContain('rnaPresetAtomsInMultipleComponents');
    expect(result.problematicAtomIds).toEqual(new Set([0]));
  });

  it('returns a missing components error when sugar or the second component is absent', () => {
    expect(
      getRnaPresetStructureValidationResult(
        createWizardStruct([0], []),
        createRnaPresetWizardState({
          sugar: [0],
        }),
      ).issues,
    ).toContain('rnaPresetMissingComponents');
  });

  it('returns a sugar connection error when required component bonds are missing, duplicated, or not allowed bond types', () => {
    expect(
      getRnaPresetStructureValidationResult(
        createWizardStruct([0, 1], []),
        createRnaPresetWizardState({
          sugar: [0],
          base: [1],
        }),
      ).issues,
    ).toContain('rnaPresetInvalidSugarConnectionBonds');

    expect(
      getRnaPresetStructureValidationResult(
        createWizardStruct(
          [0, 1, 2],
          [
            { begin: 0, end: 1 },
            { begin: 2, end: 1 },
          ],
        ),
        createRnaPresetWizardState({
          sugar: [0, 2],
          base: [1],
        }),
      ).issues,
    ).toContain('rnaPresetInvalidSugarConnectionBonds');

    expect(
      getRnaPresetStructureValidationResult(
        createWizardStruct(
          [0, 1],
          [
            {
              begin: 0,
              end: 1,
              type: Bond.PATTERN.TYPE.SINGLE + 1,
              stereo: Bond.PATTERN.STEREO.NONE,
            },
          ],
        ),
        createRnaPresetWizardState({
          sugar: [0],
          base: [1],
        }),
      ).issues,
    ).toContain('rnaPresetInvalidSugarConnectionBonds');
  });

  it('returns a base-phosphate error when base is directly bonded to phosphate', () => {
    const result = getRnaPresetStructureValidationResult(
      createWizardStruct(
        [0, 1, 2],
        [
          { begin: 0, end: 1 },
          { begin: 1, end: 2 },
          { begin: 0, end: 2 },
        ],
      ),
      createRnaPresetWizardState({
        sugar: [1],
        base: [0],
        phosphate: [2],
      }),
    );

    expect(result.issues).toContain('rnaPresetUnexpectedBasePhosphateBond');
  });
});

function createRnaPresetWizardState({
  sugar,
  base = [],
  phosphate = [],
}: {
  sugar: number[];
  base?: number[];
  phosphate?: number[];
}): RnaPresetComponentStructures {
  return {
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
  };
}

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
