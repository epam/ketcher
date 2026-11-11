import { KetMonomerClass, type MonomerItemType, Struct } from 'ketcher-core';
import {
  getIdtAliasCollisions,
  getMonomerPropertyVisibility,
  getOtherLibraryMonomers,
  hasMonomerFieldCollision,
  isValidMonomerName,
} from './MonomerCreationWizardFields.utils';

describe('getMonomerPropertyVisibility', () => {
  it.each`
    type                         | naturalAnalogue | modificationTypes | helmAlias | bilnAlias | idtAlias
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
      idtAlias,
    }) => {
      expect(getMonomerPropertyVisibility(type)).toEqual({
        displayNaturalAnalogue: naturalAnalogue,
        displayModificationTypes: modificationTypes,
        displayAliases: helmAlias || bilnAlias || idtAlias,
        displayHelmAlias: helmAlias,
        displayBilnAlias: bilnAlias,
        displayIdtAlias: idtAlias,
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

  it('checks IDT aliases against other entries when replacing a monomer', () => {
    const aliases = {
      base: 'custom',
      modifications: { endpoint5: '/5custom/' },
    };
    const edited = {
      ...original,
      props: { ...original.props, idtAliases: aliases },
    };
    expect(
      getIdtAliasCollisions(getOtherLibraryMonomers([edited], edited), aliases),
    ).toEqual({
      base: false,
      endpoint5: false,
      internal: false,
      endpoint3: false,
    });
    const conflicting = {
      ...other,
      props: { ...other.props, idtAliases: aliases },
    };
    expect(
      getIdtAliasCollisions(
        getOtherLibraryMonomers([edited, conflicting], edited),
        aliases,
      ),
    ).toEqual({
      base: true,
      endpoint5: true,
      internal: false,
      endpoint3: false,
    });
    expect(
      getIdtAliasCollisions(getOtherLibraryMonomers([edited]), aliases).base,
    ).toBe(true);
  });

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
