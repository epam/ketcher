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
import cloneDeep from 'lodash/cloneDeep';
import { Sugar, UnsplitNucleotide } from 'ketcher-core';
import {
  hasUnsplitNucleotideWithoutSugars,
  isAntisenseCreationDisabled,
  isAntisenseOptionVisible,
} from 'components/contextMenu/SelectedMonomersContextMenu/helpers';

const createUnsplit = (
  naturalAnalogCode: string,
  hydrogenBonds: unknown[] = [],
) =>
  cloneDeep(
    Object.assign(Object.create(UnsplitNucleotide.prototype), {
      hydrogenBonds,
      monomerItem: {
        props: {
          MonomerNaturalAnalogCode: naturalAnalogCode,
        },
      },
    }),
  );

const createSugar = () =>
  cloneDeep(
    Object.assign(Object.create(Sugar.prototype), {
      monomerItem: {
        props: {
          MonomerNaturalAnalogCode: 'R',
        },
      },
    }),
  );

describe('SelectedMonomersContextMenu helpers — unsplit nucleotides', () => {
  it('shows antisense option for unsplit with natural analogue A', () => {
    expect(isAntisenseOptionVisible([createUnsplit('A')])).toBe(true);
  });

  it('shows antisense option for unsplit with natural analogue X', () => {
    expect(isAntisenseOptionVisible([createUnsplit('X')])).toBe(true);
  });

  it('disables antisense for unsplit with natural analogue X', () => {
    expect(isAntisenseCreationDisabled([createUnsplit('X')])).toBe(true);
  });

  it('disables antisense for H-bonded unsplit', () => {
    expect(isAntisenseCreationDisabled([createUnsplit('A', [{ id: 1 }])])).toBe(
      true,
    );
  });

  it('disables antisense for unsplit with ambiguous analogue N', () => {
    expect(isAntisenseCreationDisabled([createUnsplit('N')])).toBe(true);
  });

  it('enables antisense for unsplit with natural analogue A', () => {
    expect(isAntisenseCreationDisabled([createUnsplit('A')])).toBe(false);
  });

  it('poisons the whole selection when one unsplit is ineligible', () => {
    expect(
      isAntisenseCreationDisabled([createUnsplit('A'), createUnsplit('X')]),
    ).toBe(true);
  });

  it('detects unsplit nucleotides without sugars', () => {
    expect(hasUnsplitNucleotideWithoutSugars([createUnsplit('A')])).toBe(true);
    expect(
      hasUnsplitNucleotideWithoutSugars([createUnsplit('A'), createSugar()]),
    ).toBe(false);
    expect(hasUnsplitNucleotideWithoutSugars([createSugar()])).toBe(false);
  });
});
