import { KetMonomerClass, type MonomerItemType, Struct } from 'ketcher-core';
import {
  getMonomerPropertyVisibility,
  getOtherLibraryMonomers,
  hasMonomerFieldCollision,
  isValidMonomerName,
} from './MonomerCreationWizardFields.utils';

describe('getMonomerPropertyVisibility', () => {
  it.each`
    type                         | naturalAnalogue | modificationTypes | helmAlias | bilnAlias
    ${KetMonomerClass.CHEM}      | ${false}        | ${false}          | ${true}   | ${true}
    ${KetMonomerClass.AminoAcid} | ${true}         | ${true}           | ${true}   | ${true}
    ${KetMonomerClass.Sugar}     | ${false}        | ${false}          | ${true}   | ${false}
    ${KetMonomerClass.Base}      | ${true}         | ${false}          | ${true}   | ${false}
    ${KetMonomerClass.Phosphate} | ${false}        | ${false}          | ${true}   | ${false}
    ${KetMonomerClass.RNA}       | ${true}         | ${false}          | ${false}  | ${false}
    ${'rnaPreset'}               | ${false}        | ${false}          | ${false}  | ${false}
  `(
    'returns supported properties for $type',
    ({ type, naturalAnalogue, modificationTypes, helmAlias, bilnAlias }) => {
      expect(getMonomerPropertyVisibility(type)).toEqual({
        displayNaturalAnalogue: naturalAnalogue,
        displayModificationTypes: modificationTypes,
        displayAliases: helmAlias || bilnAlias,
        displayHelmAlias: helmAlias,
        displayBilnAlias: bilnAlias,
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

  it('rejects a HELM alias used in another class', () => {
    expect(
      hasMonomerFieldCollision(
        [other],
        'aliasHELM',
        'helmB',
        KetMonomerClass.CHEM,
      ),
    ).toBe(true);
  });

  it('excludes the original modification types by persistent identity', () => {
    expect(getOtherLibraryMonomers([original, other], { ...original })).toEqual(
      [other],
    );
  });
});
