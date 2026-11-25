import {
  type IKetMacromoleculesContent,
  KetMonomerClass,
  type MonomerItemType,
  Struct,
} from 'ketcher-core';
import {
  getMonomerPropertyVisibility,
  getOtherLibraryMonomers,
  hasAxoLabsAliasCollision,
  hasMonomerFieldCollision,
  isValidMonomerName,
} from './MonomerCreationWizardFields.utils';

describe('getMonomerPropertyVisibility', () => {
  it.each`
    type                         | naturalAnalogue | modificationTypes | helmAlias | bilnAlias | axoLabsAlias
    ${KetMonomerClass.CHEM}      | ${false}        | ${false}          | ${true}   | ${true}   | ${true}
    ${KetMonomerClass.AminoAcid} | ${true}         | ${true}           | ${true}   | ${true}   | ${false}
    ${KetMonomerClass.Sugar}     | ${false}        | ${false}          | ${true}   | ${false}  | ${false}
    ${KetMonomerClass.Base}      | ${true}         | ${false}          | ${true}   | ${false}  | ${false}
    ${KetMonomerClass.Phosphate} | ${false}        | ${false}          | ${true}   | ${false}  | ${true}
    ${KetMonomerClass.RNA}       | ${true}         | ${false}          | ${false}  | ${false}  | ${true}
    ${'rnaPreset'}               | ${false}        | ${false}          | ${false}  | ${false}  | ${false}
  `(
    'returns supported properties for $type',
    ({
      type,
      naturalAnalogue,
      modificationTypes,
      helmAlias,
      bilnAlias,
      axoLabsAlias,
    }) => {
      expect(getMonomerPropertyVisibility(type)).toEqual({
        displayNaturalAnalogue: naturalAnalogue,
        displayModificationTypes: modificationTypes,
        displayHelmAlias: helmAlias,
        displayBilnAlias: bilnAlias,
        displayAxoLabsAlias: axoLabsAlias,
      });
    },
  );
});
describe('library edit field uniqueness', () => {
  it('accepts existing library names with punctuation and their copies', () => {
    const name = "1',2'-dideoxyribose";
    expect(isValidMonomerName(name, name)).toBe(true);
    expect(isValidMonomerName(`${name}_Copy`, `${name}_Copy`)).toBe(true);
    expect(isValidMonomerName(`${name} changed`, name)).toBe(false);
  });

  const original: MonomerItemType = {
    label: 'A',
    struct: new Struct(),
    props: {
      id: 'original',
      Name: 'Alanine',
      MonomerNaturalAnalogCode: 'A',
      MonomerName: 'A',
      MonomerClass: KetMonomerClass.AminoAcid,
      aliasHELM: 'helmA',
      aliasBILN: 'bilnA',
      modificationTypes: ['Natural amino acid'],
    },
  };
  const other: MonomerItemType = {
    ...original,
    props: {
      id: 'other',
      Name: 'Other',
      MonomerNaturalAnalogCode: 'A',
      MonomerName: 'B',
      MonomerClass: KetMonomerClass.AminoAcid,
      aliasHELM: 'helmB',
      aliasBILN: 'bilnB',
    },
  };

  it.each([
    ['symbol', 'A'],
    ['aliasHELM', 'helmA'],
    ['aliasBILN', 'bilnA'],
  ] as const)('permits the original unchanged %s', (field, value) => {
    const library = getOtherLibraryMonomers([original, other], original);
    expect(
      hasMonomerFieldCollision(
        library,
        field,
        value,
        KetMonomerClass.AminoAcid,
      ),
    ).toBe(false);
    expect(
      hasMonomerFieldCollision(
        getOtherLibraryMonomers([original, other]),
        field,
        value,
        KetMonomerClass.AminoAcid,
      ),
    ).toBe(true);
  });

  it.each([
    ['symbol', 'B'],
    ['symbol', 'helmB'],
    ['aliasHELM', 'B'],
    ['aliasHELM', 'helmB'],
    ['aliasBILN', 'bilnB'],
  ] as const)('rejects another entry’s %s', (field, value) => {
    expect(
      hasMonomerFieldCollision(
        getOtherLibraryMonomers([original, other], original),
        field,
        value,
        KetMonomerClass.AminoAcid,
      ),
    ).toBe(true);
  });

  it.each([KetMonomerClass.CHEM, KetMonomerClass.Base])(
    'allows a peptide HELM alias to be reused by a %s monomer',
    (type) => {
      expect(
        hasMonomerFieldCollision([other], 'aliasHELM', 'helmB', type),
      ).toBe(false);
    },
  );

  it.each([
    KetMonomerClass.Sugar,
    KetMonomerClass.Base,
    KetMonomerClass.Phosphate,
  ])('rejects a HELM alias already used by a %s monomer', (type) => {
    const rnaEntry: MonomerItemType = {
      ...other,
      props: { ...other.props, MonomerClass: KetMonomerClass.Sugar },
    };
    expect(
      hasMonomerFieldCollision([rnaEntry], 'aliasHELM', 'helmB', type),
    ).toBe(true);
  });

  it.each([
    ['aliasHELM', KetMonomerClass.AminoAcid],
    ['aliasBILN', KetMonomerClass.CHEM],
  ] as const)(
    'allows an unchanged %s even when bundled entries share it',
    (field, sharedEntryClass) => {
      const sharedAliasEntry: MonomerItemType = {
        ...other,
        props: {
          ...other.props,
          MonomerClass: sharedEntryClass,
          [field]: original.props[field],
        },
      };
      expect(
        hasMonomerFieldCollision(
          [sharedAliasEntry],
          field,
          original.props[field] as string,
          KetMonomerClass.AminoAcid,
          original,
        ),
      ).toBe(false);
      expect(
        hasMonomerFieldCollision(
          [sharedAliasEntry],
          field,
          original.props[field] as string,
          KetMonomerClass.AminoAcid,
        ),
      ).toBe(true);
    },
  );

  it('excludes the original modification types by persistent identity', () => {
    expect(getOtherLibraryMonomers([original, other], { ...original })).toEqual(
      [other],
    );
  });
});

describe('hasAxoLabsAliasCollision', () => {
  const monomer = (aliasAxoLabs?: string): MonomerItemType => ({
    label: 'A',
    struct: new Struct(),
    props: {
      Name: 'Alanine',
      MonomerNaturalAnalogCode: 'A',
      MonomerName: 'A',
      MonomerClass: KetMonomerClass.CHEM,
      aliasAxoLabs,
    },
  });
  const emptyJson = {
    root: { templates: [] },
  } as unknown as IKetMacromoleculesContent;
  const parsedJson = {
    root: { templates: [{ $ref: 'monomerGroupTemplate-X' }] },
    'monomerGroupTemplate-X': {
      type: 'monomerGroupTemplate',
      aliasAxoLabs: 'preset1',
    },
    'monomerTemplate-Y': { type: 'monomerTemplate', aliasAxoLabs: 'notPreset' },
  } as unknown as IKetMacromoleculesContent;

  it('finds a monomer with the same alias, ignoring brackets', () => {
    expect(hasAxoLabsAliasCollision([monomer('abc')], emptyJson, '(abc)')).toBe(
      true,
    );
    expect(hasAxoLabsAliasCollision([monomer('(abc)')], emptyJson, 'abc')).toBe(
      true,
    );
  });

  it('finds a preset with the same alias', () => {
    expect(hasAxoLabsAliasCollision([], parsedJson, '(preset1)')).toBe(true);
  });

  it('is case-sensitive', () => {
    expect(hasAxoLabsAliasCollision([monomer('abc')], emptyJson, 'ABC')).toBe(
      false,
    );
    expect(hasAxoLabsAliasCollision([], parsedJson, 'PRESET1')).toBe(false);
  });

  it('reports no collision for unused aliases and monomers without one', () => {
    expect(
      hasAxoLabsAliasCollision([monomer(), monomer('x')], parsedJson, 'abc'),
    ).toBe(false);
  });
});
