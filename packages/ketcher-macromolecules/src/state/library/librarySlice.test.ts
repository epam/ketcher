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
} from 'ketcher-core';
import { MONOMER_TYPES } from 'src/constants';
import { RootState } from 'state';

import { selectFilteredMonomers } from './librarySlice';

const createMonomer = ({
  monomerName,
  name = monomerName,
  naturalAnalogCode,
  aliasHELM,
  hidden = false,
}: {
  monomerName: string;
  name?: string;
  naturalAnalogCode: string;
  aliasHELM?: string;
  hidden?: boolean;
}): MonomerItemType =>
  ({
    label: monomerName,
    props: {
      MonomerNaturalAnalogCode: naturalAnalogCode,
      MonomerName: monomerName,
      Name: name,
      MonomerType: MONOMER_TYPES.PEPTIDE,
      MonomerClass: KetMonomerClass.AminoAcid,
      aliasHELM,
      hidden,
    },
    struct: {},
  } as MonomerItemType);

const createAmbiguousAminoAcid = (label: string): AmbiguousMonomerType => {
  const componentMonomer = createMonomer({
    monomerName: 'Alanine',
    naturalAnalogCode: 'A',
  });

  return {
    id: label,
    label,
    isAmbiguous: true,
    monomers: [
      {
        monomerItem: componentMonomer,
      },
    ],
    options: [{ templateId: componentMonomer.props.MonomerName }],
    subtype: KetAmbiguousMonomerTemplateSubType.ALTERNATIVES,
  } as unknown as AmbiguousMonomerType;
};

const createState = (
  searchFilter: string,
  monomers: Array<MonomerItemType | AmbiguousMonomerType>,
): RootState =>
  ({
    library: {
      searchFilter,
      monomers,
      favorites: {},
    },
  } as RootState);

describe('selectFilteredMonomers', () => {
  it('returns natural amino acid by exact three-letter code', () => {
    const tryptophan = createMonomer({
      monomerName: 'Tryptophan',
      naturalAnalogCode: 'W',
    });
    const alanine = createMonomer({
      monomerName: 'Alanine',
      naturalAnalogCode: 'A',
    });

    const result = selectFilteredMonomers(
      createState('Trp', [tryptophan, alanine]),
    );

    expect(result).toContainEqual(expect.objectContaining(tryptophan));
    expect(result).not.toContainEqual(expect.objectContaining(alanine));
  });

  it('matches three-letter amino acid codes case-insensitively', () => {
    const tryptophan = createMonomer({
      monomerName: 'Tryptophan',
      naturalAnalogCode: 'W',
    });

    const result = selectFilteredMonomers(createState('trp', [tryptophan]));

    expect(result).toContainEqual(expect.objectContaining(tryptophan));
  });

  it('returns ambiguous amino acid items by ambiguous three-letter code', () => {
    const anyAminoAcid = createAmbiguousAminoAcid('X');

    const result = selectFilteredMonomers(createState('Xaa', [anyAminoAcid]));

    expect(result).toContainEqual(expect.objectContaining(anyAminoAcid));
  });

  it('preserves existing alias search behavior', () => {
    const monomer = createMonomer({
      monomerName: 'D-Alanine',
      naturalAnalogCode: 'A',
      aliasHELM: 'dAla',
    });

    const result = selectFilteredMonomers(createState('dala', [monomer]));

    expect(result).toContainEqual(expect.objectContaining(monomer));
  });

  it('keeps hidden monomers excluded from three-letter code search results', () => {
    const hiddenTryptophan = createMonomer({
      monomerName: 'Hidden Tryptophan',
      naturalAnalogCode: 'W',
      hidden: true,
    });

    const result = selectFilteredMonomers(
      createState('Trp', [hiddenTryptophan]),
    );

    expect(result).toHaveLength(0);
  });
});
