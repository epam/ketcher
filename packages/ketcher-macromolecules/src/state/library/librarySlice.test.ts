/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import {
  AmbiguousMonomerType,
  KetAmbiguousMonomerTemplateSubType,
  KetMonomerClass,
  MonomerItemType,
  MonomerOrAmbiguousType,
} from 'ketcher-core';
import { RootState } from 'state';
import { selectFilteredMonomers } from './librarySlice';

const createAminoAcid = (oneLetter: string, name: string): MonomerItemType => ({
  label: oneLetter,
  struct: {} as MonomerItemType['struct'],
  props: {
    MonomerName: oneLetter,
    Name: name,
    MonomerNaturalAnalogCode: oneLetter,
    MonomerType: 'PEPTIDE',
    MonomerClass: KetMonomerClass.AminoAcid,
  },
});

const createNonAminoAcid = (
  oneLetter: string,
  name: string,
  monomerClass: KetMonomerClass,
  monomerType: string,
): MonomerItemType => ({
  label: oneLetter,
  struct: {} as MonomerItemType['struct'],
  props: {
    MonomerName: oneLetter,
    Name: name,
    MonomerNaturalAnalogCode: oneLetter,
    MonomerType: monomerType,
    MonomerClass: monomerClass,
  },
});

const createAmbiguous = (
  label: string,
  componentClasses: KetMonomerClass[],
): AmbiguousMonomerType =>
  ({
    label,
    id: `ambiguous-${label}`,
    isAmbiguous: true,
    subtype: KetAmbiguousMonomerTemplateSubType.ALTERNATIVES,
    options: [],
    monomers: componentClasses.map((monomerClass) => ({
      monomerItem: {
        props: { MonomerClass: monomerClass },
      },
    })),
  } as unknown as AmbiguousMonomerType);

const aminoAcids: MonomerItemType[] = [
  createAminoAcid('A', 'Alanine'),
  createAminoAcid('W', 'Tryptophan'),
  createAminoAcid('I', 'Isoleucine'),
  createAminoAcid('N', 'Asparagine'),
  createAminoAcid('Q', 'Glutamine'),
  createAminoAcid('P', 'Proline'),
  createAminoAcid('R', 'Arginine'),
];

const collisionMonomers: MonomerItemType[] = [
  createNonAminoAcid('A', 'Adenine', KetMonomerClass.Base, 'RNA'),
  createNonAminoAcid('P', 'Phosphate', KetMonomerClass.Phosphate, 'RNA'),
  createNonAminoAcid('R', 'Ribose', KetMonomerClass.Sugar, 'RNA'),
];

const ambiguousAminoAcidB = createAmbiguous('B', [
  KetMonomerClass.AminoAcid,
  KetMonomerClass.AminoAcid,
]);
const ambiguousAminoAcidJ = createAmbiguous('J', [
  KetMonomerClass.AminoAcid,
  KetMonomerClass.AminoAcid,
]);
const ambiguousAminoAcidX = createAmbiguous('X', [
  KetMonomerClass.AminoAcid,
  KetMonomerClass.AminoAcid,
]);
const ambiguousAminoAcidZ = createAmbiguous('Z', [
  KetMonomerClass.AminoAcid,
  KetMonomerClass.AminoAcid,
]);
const ambiguousNucleotideB = createAmbiguous('B', [
  KetMonomerClass.Base,
  KetMonomerClass.Base,
]);

const allMonomers: MonomerOrAmbiguousType[] = [
  ...aminoAcids,
  ...collisionMonomers,
  ambiguousAminoAcidB,
  ambiguousAminoAcidJ,
  ambiguousAminoAcidX,
  ambiguousAminoAcidZ,
  ambiguousNucleotideB,
];

const buildState = (searchFilter: string): RootState =>
  ({
    library: {
      searchFilter,
      monomers: allMonomers,
      favorites: {},
      defaultRnaPresets: [],
      selectedTabIndex: 0,
    },
  } as RootState);

const getMatchedLabels = (searchFilter: string) =>
  selectFilteredMonomers(buildState(searchFilter)).map((item) =>
    item.isAmbiguous
      ? (item as AmbiguousMonomerType).label
      : (item as MonomerItemType).props.MonomerName,
  );

const getMatchedAminoAcidLabels = (searchFilter: string) =>
  selectFilteredMonomers(buildState(searchFilter))
    .filter((item) => {
      if (item.isAmbiguous) {
        const ambiguous = item as AmbiguousMonomerType;
        return (
          ambiguous.monomers.length > 0 &&
          ambiguous.monomers.every(
            (c) =>
              c.monomerItem.props.MonomerClass === KetMonomerClass.AminoAcid,
          )
        );
      }
      return (
        (item as MonomerItemType).props.MonomerClass ===
        KetMonomerClass.AminoAcid
      );
    })
    .map((item) =>
      item.isAmbiguous
        ? (item as AmbiguousMonomerType).label
        : (item as MonomerItemType).props.MonomerName,
    );

describe('selectFilteredMonomers — three-letter amino-acid codes', () => {
  it.each([
    ['Trp', 'W'],
    ['Ile', 'I'],
    ['Asn', 'N'],
    ['Gln', 'Q'],
    ['Asx', 'B'],
    ['Xle', 'J'],
    ['Xaa', 'X'],
    ['Glx', 'Z'],
  ])(
    'returns exactly the natural monomer for failing code %s → %s',
    (code, expectedLabel) => {
      expect(getMatchedAminoAcidLabels(code)).toEqual([expectedLabel]);
    },
  );

  it.each(['ala', 'ALA', 'aLa'])(
    'matches alanine case-insensitively for %s',
    (query) => {
      expect(getMatchedAminoAcidLabels(query)).toEqual(['A']);
    },
  );

  it('matches partial three-letter code Tr → Trp', () => {
    expect(getMatchedAminoAcidLabels('Tr')).toEqual(['W']);
  });

  it('Gln returns only Q, not Glx/Z', () => {
    expect(getMatchedAminoAcidLabels('Gln')).toEqual(['Q']);
  });

  it('Glx returns only Z, not Gln/Q', () => {
    expect(getMatchedAminoAcidLabels('Glx')).toEqual(['Z']);
  });

  it('Ala does not return Adenine (class gate)', () => {
    const labels = getMatchedLabels('Ala');
    expect(labels).toContain('A');
    expect(labels).toHaveLength(1);
    expect(
      selectFilteredMonomers(buildState('Ala')).every(
        (item) =>
          !item.isAmbiguous &&
          (item as MonomerItemType).props.MonomerClass ===
            KetMonomerClass.AminoAcid,
      ),
    ).toBe(true);
  });

  it('Pro does not return Phosphate (class gate)', () => {
    expect(getMatchedAminoAcidLabels('Pro')).toEqual(['P']);
    expect(
      selectFilteredMonomers(buildState('Pro')).some(
        (item) =>
          !item.isAmbiguous &&
          (item as MonomerItemType).props.MonomerClass ===
            KetMonomerClass.Phosphate,
      ),
    ).toBe(false);
  });

  it('Arg does not return Ribose (class gate)', () => {
    expect(getMatchedAminoAcidLabels('Arg')).toEqual(['R']);
    expect(
      selectFilteredMonomers(buildState('Arg')).some(
        (item) =>
          !item.isAmbiguous &&
          (item as MonomerItemType).props.MonomerClass ===
            KetMonomerClass.Sugar,
      ),
    ).toBe(false);
  });

  it('Asx returns amino-acid B, not nucleotide-B monomers', () => {
    const results = selectFilteredMonomers(buildState('Asx'));
    expect(results).toHaveLength(1);
    expect(results[0].isAmbiguous).toBe(true);
    expect((results[0] as AmbiguousMonomerType).label).toBe('B');
    expect(
      (results[0] as AmbiguousMonomerType).monomers.every(
        (c) => c.monomerItem.props.MonomerClass === KetMonomerClass.AminoAcid,
      ),
    ).toBe(true);
  });

  it('still matches single-letter A and full name Tryptophan', () => {
    expect(getMatchedAminoAcidLabels('A')).toContain('A');
    expect(getMatchedAminoAcidLabels('Tryptophan')).toEqual(['W']);
  });

  it.each(['Xyz', 'Al@', 'Al1'])(
    'returns nothing and does not throw for invalid query %s',
    (query) => {
      expect(() => getMatchedLabels(query)).not.toThrow();
      expect(getMatchedLabels(query)).toEqual([]);
    },
  );

  it('empty search returns the full listing', () => {
    expect(selectFilteredMonomers(buildState(''))).toHaveLength(
      allMonomers.length,
    );
  });
});
