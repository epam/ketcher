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
import { AMINO_ACID_ONE_TO_THREE_LETTER_CODE } from 'src/constants';
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

const createComponent = (
  oneLetter: string,
  name: string,
  monomerClass: KetMonomerClass = KetMonomerClass.AminoAcid,
) => ({
  monomerItem: {
    props: { MonomerName: oneLetter, Name: name, MonomerClass: monomerClass },
  },
});

const createAmbiguous = (
  label: string,
  components: ReturnType<typeof createComponent>[],
): AmbiguousMonomerType =>
  ({
    label,
    id: `ambiguous-${label}`,
    isAmbiguous: true,
    subtype: KetAmbiguousMonomerTemplateSubType.ALTERNATIVES,
    options: [],
    monomers: components,
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
  createComponent('D', 'Aspartic acid'),
  createComponent('N', 'Asparagine'),
]);
const ambiguousAminoAcidJ = createAmbiguous('J', [
  createComponent('L', 'Leucine'),
  createComponent('I', 'Isoleucine'),
]);
const ambiguousAminoAcidX = createAmbiguous('X', [
  createComponent('A', 'Alanine'),
  createComponent('W', 'Tryptophan'),
  createComponent('I', 'Isoleucine'),
  createComponent('N', 'Asparagine'),
  createComponent('Q', 'Glutamine'),
]);
const ambiguousAminoAcidZ = createAmbiguous('Z', [
  createComponent('E', 'Glutamic acid'),
  createComponent('Q', 'Glutamine'),
]);
const ambiguousNucleotideB = createAmbiguous('B', [
  createComponent('C', 'C base', KetMonomerClass.Base),
  createComponent('G', 'G base', KetMonomerClass.Base),
  createComponent('T', 'T base', KetMonomerClass.Base),
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
    ['Trp', ['W', 'X']],
    ['Ile', ['I', 'J', 'X']],
    ['Asn', ['B', 'N', 'X']],
    ['Gln', ['Q', 'X', 'Z']],
    ['Asx', ['B']],
    ['Xle', ['J']],
    ['Xaa', ['X']],
    ['Glx', ['Z']],
  ])(
    'returns expected amino-acid monomers for code %s → %j',
    (code, expectedLabels) => {
      expect(getMatchedAminoAcidLabels(code).sort()).toEqual(
        [...expectedLabels].sort(),
      );
    },
  );

  it.each(['ala', 'ALA', 'aLa'])(
    'matches alanine case-insensitively for %s (including ambiguous X)',
    (query) => {
      expect(getMatchedAminoAcidLabels(query).sort()).toEqual(['A', 'X']);
    },
  );

  it('matches partial three-letter code Tr → Trp (including ambiguous X)', () => {
    expect(getMatchedAminoAcidLabels('Tr').sort()).toEqual(['W', 'X']);
  });

  it('Gln returns Q plus ambiguous monomers that contain glutamine', () => {
    expect(getMatchedAminoAcidLabels('Gln').sort()).toEqual(['Q', 'X', 'Z']);
  });

  it('Glx returns only Z, not Gln/Q', () => {
    expect(getMatchedAminoAcidLabels('Glx')).toEqual(['Z']);
  });

  it('Ala does not return Base/Phosphate/Sugar monomers (class gate)', () => {
    const results = selectFilteredMonomers(buildState('Ala'));
    expect(results.some((item) => !item.isAmbiguous)).toBe(true);
    expect(
      results.every((item) => {
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
        const monomerClass = (item as MonomerItemType).props.MonomerClass;
        return (
          monomerClass !== KetMonomerClass.Base &&
          monomerClass !== KetMonomerClass.Phosphate &&
          monomerClass !== KetMonomerClass.Sugar
        );
      }),
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
    expect(getMatchedAminoAcidLabels('Tryptophan').sort()).toEqual(['W', 'X']);
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

  it('nucleotide ambiguous B matches none of the 26 three-letter amino-acid codes', () => {
    const uniqueCodes = [
      ...new Set(Object.values(AMINO_ACID_ONE_TO_THREE_LETTER_CODE)),
    ];

    uniqueCodes.forEach((code) => {
      const results = selectFilteredMonomers(buildState(code));
      expect(
        results.some(
          (item) =>
            item.isAmbiguous &&
            (item as AmbiguousMonomerType).label === 'B' &&
            (item as AmbiguousMonomerType).monomers.every(
              (c) => c.monomerItem.props.MonomerClass === KetMonomerClass.Base,
            ),
        ),
      ).toBe(false);
    });
  });

  it('ambiguous X matches Trp via its tryptophan component', () => {
    expect(getMatchedAminoAcidLabels('Trp').sort()).toEqual(['W', 'X']);
  });
});
