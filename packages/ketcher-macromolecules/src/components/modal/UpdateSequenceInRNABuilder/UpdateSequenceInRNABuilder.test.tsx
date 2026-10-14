import { type Mock } from 'vitest';
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

import { vi } from 'vitest';
import { withThemeAndStoreProvider } from 'src/testUtils/storeProviders';

import { fireEvent, render, screen } from '@testing-library/react';
import {
  LabeledNodesWithPositionInSequence,
  Entities,
  STRAND_TYPE,
} from 'ketcher-core';
import { UpdateSequenceInRNABuilder } from './UpdateSequenceInRNABuilder';
import { getCountOfMirroredNucleoelements } from 'helpers/countNucleoelents';

vi.mock('helpers/countNucleoelents', async () => ({
  ...(await vi.importActual('helpers/countNucleoelents')),
  getCountOfMirroredNucleoelements: vi.fn(() => 0),
}));

const mockProps = {
  isModalOpen: true,
  onClose: vi.fn(),
};

describe('UpdateSequenceInRNABuilder modal component', () => {
  afterEach(() => {
    (getCountOfMirroredNucleoelements as Mock).mockReturnValue(0);
  });

  const labeledNucleotide: LabeledNodesWithPositionInSequence = {
    type: Entities.Nucleotide,
    baseLabel: 'A',
    phosphateLabel: 'P',
    sugarLabel: 'R',
    nodeIndexOverall: 0,
    hasR1Connection: false,
    strandType: STRAND_TYPE.SENSE,
  };

  // Distinct nodes (not the same object 3 times) so a length-vs-identity
  // mixup in the write-back would be visible if it occurred.
  const threeSenseDuplexPositions: LabeledNodesWithPositionInSequence[] = [
    { ...labeledNucleotide, nodeIndexOverall: 0 },
    { ...labeledNucleotide, nodeIndexOverall: 1 },
    { ...labeledNucleotide, nodeIndexOverall: 2 },
  ];

  it('should render correctly', () => {
    expect(
      render(
        withThemeAndStoreProvider(
          <UpdateSequenceInRNABuilder {...mockProps} />,
          {
            rnaBuilder: {
              sequenceSelection: [labeledNucleotide, labeledNucleotide],
            },
          },
        ),
      ),
    ).toMatchSnapshot();
  });
  it('should close modal', () => {
    const modifySequenceInRnaBuilderDispatch = vi.fn();
    render(
      withThemeAndStoreProvider(<UpdateSequenceInRNABuilder {...mockProps} />, {
        rnaBuilder: {
          sequenceSelection: [labeledNucleotide],
        },
        editor: {
          editor: {
            events: {
              modifySequenceInRnaBuilder: {
                dispatch: modifySequenceInRnaBuilderDispatch,
              },
              turnOffSequenceEditInRNABuilderMode: { dispatch: () => true },
            },
          },
        },
      }),
    );
    const cancelButton = screen.getByTestId('update-sequence-cancel-button');
    fireEvent.click(cancelButton);
    expect(mockProps.onClose).toHaveBeenCalled();
    expect(modifySequenceInRnaBuilderDispatch).not.toHaveBeenCalled();
  });

  it('should execute update', () => {
    render(
      withThemeAndStoreProvider(<UpdateSequenceInRNABuilder {...mockProps} />, {
        rnaBuilder: {
          sequenceSelection: [labeledNucleotide],
        },
        editor: {
          editor: {
            events: {
              modifySequenceInRnaBuilder: { dispatch: () => true },
              turnOffSequenceEditInRNABuilderMode: { dispatch: () => true },
            },
          },
        },
      }),
    );
    const yesButton = screen.getByTestId('update-sequence-yes-button');
    fireEvent.click(yesButton);
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  // Proves the second and third links of Task 5 Step 4's payload -> redux ->
  // confirmation chain: given the redux sequenceSelection a duplex context
  // menu click would have written (Task 5's filter keeps one entry per
  // duplex position, so a one-strand selection of N positions produces an
  // N-length array here), this modal's own real confirmation text names N,
  // and its own real "Yes" handler dispatches modifySequenceInRnaBuilder
  // with exactly that N-length array - not a re-derived count.
  describe('for a one-strand selection of N duplex positions', () => {
    it('names N in its own rendered confirmation text', () => {
      render(
        withThemeAndStoreProvider(
          <UpdateSequenceInRNABuilder {...mockProps} />,
          {
            rnaBuilder: {
              sequenceSelection: threeSenseDuplexPositions,
            },
          },
        ),
      );

      expect(
        screen.getByTestId('update-sequence-modal-body'),
      ).toHaveTextContent(
        'You are going to modify 3 nucleotides. Are you sure?',
      );
    });

    it('names the additional nucleotides when the update will change some', () => {
      (getCountOfMirroredNucleoelements as Mock).mockReturnValue(2);
      render(
        withThemeAndStoreProvider(
          <UpdateSequenceInRNABuilder {...mockProps} />,
          {
            rnaBuilder: { sequenceSelection: threeSenseDuplexPositions },
          },
        ),
      );

      expect(
        screen.getByTestId('update-sequence-modal-body'),
      ).toHaveTextContent(
        'You are going to modify 3 nucleotides, and that will change 2 additional nucleotides. Are you sure?',
      );
    });

    it('dispatches modifySequenceInRnaBuilder with exactly those N entries on confirm', () => {
      const modifySequenceInRnaBuilderDispatch = vi.fn();

      render(
        withThemeAndStoreProvider(
          <UpdateSequenceInRNABuilder {...mockProps} />,
          {
            rnaBuilder: {
              sequenceSelection: threeSenseDuplexPositions,
            },
            editor: {
              editor: {
                events: {
                  modifySequenceInRnaBuilder: {
                    dispatch: modifySequenceInRnaBuilderDispatch,
                  },
                  turnOffSequenceEditInRNABuilderMode: { dispatch: () => true },
                },
              },
            },
          },
        ),
      );

      fireEvent.click(screen.getByTestId('update-sequence-yes-button'));

      expect(modifySequenceInRnaBuilderDispatch).toHaveBeenCalledTimes(1);
      expect(modifySequenceInRnaBuilderDispatch).toHaveBeenCalledWith(
        threeSenseDuplexPositions,
      );
      expect(modifySequenceInRnaBuilderDispatch.mock.calls[0][0]).toHaveLength(
        3,
      );
    });
  });
});
