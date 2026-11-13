/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/
import cloneDeep from 'lodash/cloneDeep';
import {
  AttachmentPointName,
  BaseMonomer,
  PolymerBond,
  Sugar,
  UnsplitNucleotide,
} from 'ketcher-core';
import {
  hasUnsplitNucleotide,
  isAntisenseCreationDisabled,
  isCycleExistsForSelectedMonomers,
  isAntisenseOptionVisible,
} from 'components/contextMenu/SelectedMonomersContextMenu/helpers';

const createUnsplit = (
  naturalAnalogCode: string,
  hydrogenBonds: unknown[] = [],
) =>
  cloneDeep(
    Object.assign(Object.create(UnsplitNucleotide.prototype), {
      hydrogenBonds,
      attachmentPointsToBonds: {},
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

const createBackbone = (length: number, isCyclic = false) => {
  const monomers = Array.from({ length }, () =>
    Object.assign(Object.create(BaseMonomer.prototype), {
      attachmentPointsToBonds: {},
      hydrogenBonds: [],
    }),
  );

  const addBond = (
    firstIndex: number,
    secondIndex: number,
    firstAttachmentPoint: AttachmentPointName,
    secondAttachmentPoint: AttachmentPointName,
  ) => {
    const firstMonomer = monomers[firstIndex];
    const secondMonomer = monomers[secondIndex];
    const bond = new PolymerBond(firstMonomer, secondMonomer);

    firstMonomer.attachmentPointsToBonds[firstAttachmentPoint] = bond;
    secondMonomer.attachmentPointsToBonds[secondAttachmentPoint] = bond;
  };

  for (let index = 0; index < length - 1; index++) {
    addBond(index, index + 1, AttachmentPointName.R2, AttachmentPointName.R1);
  }

  if (isCyclic && length > 2) {
    addBond(length - 1, 0, AttachmentPointName.R2, AttachmentPointName.R1);
  }

  return monomers;
};

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

  it('keeps antisense available when another selected chain is ineligible', () => {
    expect(
      isAntisenseCreationDisabled([createUnsplit('A'), createUnsplit('X')]),
    ).toBe(false);
  });

  it('disables antisense when every selected chain is ineligible', () => {
    expect(
      isAntisenseCreationDisabled([
        createUnsplit('X'),
        createUnsplit('A', [{ id: 1 }]),
      ]),
    ).toBe(true);
  });

  it('detects unsplit nucleotides in the selection', () => {
    expect(hasUnsplitNucleotide([createUnsplit('A')])).toBe(true);
    expect(hasUnsplitNucleotide([createUnsplit('A'), createSugar()])).toBe(
      true,
    );
    expect(hasUnsplitNucleotide([createSugar()])).toBe(false);
  });
});

describe('isCycleExistsForSelectedMonomers', () => {
  it('handles a linear selection longer than the call stack', () => {
    expect(isCycleExistsForSelectedMonomers(createBackbone(11_500))).toBe(
      false,
    );
  });

  it('detects a cycle in a selected backbone', () => {
    expect(isCycleExistsForSelectedMonomers(createBackbone(3, true))).toBe(
      true,
    );
  });
});
