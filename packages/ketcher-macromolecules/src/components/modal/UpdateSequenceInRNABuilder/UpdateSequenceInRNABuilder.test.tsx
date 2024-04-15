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

import { fireEvent, render, screen } from '@testing-library/react';
import { LabeledNucleotideWithPositionInSequence } from 'ketcher-core';
import { UpdateSequenceInRNABuilder } from './UpdateSequenceInRNABuilder';

const mockProps = {
  isModalOpen: true,
  onClose: jest.fn(),
};

describe('UpdateSequenceInRNABuilder modal component', () => {
  const labeledNucleotide: LabeledNucleotideWithPositionInSequence = {
    baseLabel: 'A',
    phosphateLabel: 'P',
    sugarLabel: 'R',
    nodeIndexOverall: 0,
  };

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
    render(
      withThemeAndStoreProvider(<UpdateSequenceInRNABuilder {...mockProps} />, {
        rnaBuilder: {
          sequenceSelection: [labeledNucleotide],
        },
        editor: {
          editor: {
            events: {
              turnOffSequenceEditInRNABuilderMode: { dispatch: () => true },
            },
          },
        },
      }),
    );
    const cancelButton = screen.getByTitle('Cancel');
    fireEvent.click(cancelButton);
    expect(mockProps.onClose).toHaveBeenCalled();
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
    const yesButton = screen.getByTitle('Yes');
    fireEvent.click(yesButton);
    expect(mockProps.onClose).toHaveBeenCalled();
  });
});
