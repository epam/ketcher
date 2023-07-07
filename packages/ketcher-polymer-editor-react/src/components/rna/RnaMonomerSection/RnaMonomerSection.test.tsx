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
import { render, screen, fireEvent } from '@testing-library/react';
import { Struct } from 'ketcher-core';
import { RnaMonomerSection } from './RnaMonomerSection';

// will be completely rewored in the nearest tasks
describe.skip('RNA Monomer Section', () => {
  // TODO Fixing a type issue with any as a temporary solution
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rnaMonomersMock: any = {
    Nucleotide: [
      {
        groupItems: [
          {
            label: 'A',
            monomers: {
              Sugar: 'R',
              Nucleobase: 'A',
              Phosphate: 'P',
            },
            struct: new Struct(),
          },
          {
            label: 'U',
            monomers: {
              Sugar: 'R',
              Nucleobase: 'U',
              Phosphate: 'P',
            },
            struct: new Struct(),
          },
        ],
        groupTitle: 'Nucleotides',
      },
    ],
    Nucleobase: [
      {
        groupItems: [
          { label: 'A', struct: new Struct() },
          { label: '2ldg', struct: new Struct() },
        ],
        groupTitle: 'Nucleobase',
      },
    ],
    Sugar: [
      {
        groupItems: [
          { label: 'R', struct: new Struct() },
          { label: 'm', struct: new Struct() },
        ],
        groupTitle: 'Sugar',
      },
    ],
    Phosphate: [
      {
        groupItems: [
          { label: 'p', struct: new Struct() },
          { label: '36dcd', struct: new Struct() },
        ],
        groupTitle: 'Phosphate',
      },
    ],
  };
  const selectItemMock = jest.fn();
  const initialMonomers = ['R', 'A', 'P'];

  it('should correct render with initial values', () => {
    render(
      withThemeAndStoreProvider(
        <RnaMonomerSection
          items={rnaMonomersMock}
          selectItem={selectItemMock}
        />
      )
    );
    const switcherButtons = screen.getAllByRole('button');
    const tabTitle = screen.getByText('Nucleotides');
    const tabContent = screen.getByText('U');

    expect(switcherButtons.length).toEqual(5);
    expect(tabTitle).toBeInTheDocument();
    expect(tabContent).toBeInTheDocument();
  });

  it('should pass correct initial monomers to switcher', () => {
    render(
      withThemeAndStoreProvider(
        <RnaMonomerSection
          items={rnaMonomersMock}
          selectItem={selectItemMock}
        />
      )
    );
    const switcherButton = screen.getByText('R(A)P');
    expect(switcherButton).toBeInTheDocument();
  });

  it('should render correct tab when each switcher button selected', () => {
    render(
      withThemeAndStoreProvider(
        <RnaMonomerSection
          items={rnaMonomersMock}
          selectItem={selectItemMock}
        />
      )
    );

    const sugarButton = screen.getByText('R');
    fireEvent.click(sugarButton);
    const sugarTab = screen.getByText('Sugar');
    expect(sugarTab).toBeInTheDocument();

    const nucleobaseButton = screen.getByText('A');
    fireEvent.click(nucleobaseButton);
    const nucleobaseTab = screen.getByText('Nucleobase');
    expect(nucleobaseTab).toBeInTheDocument();

    const phosphateButton = screen.getByText('P');
    fireEvent.click(phosphateButton);
    const phosphateTab = screen.getByText('Phosphate');
    expect(phosphateTab).toBeInTheDocument();
  });

  it('should pass correct arg to callback function after changing type', () => {
    render(
      withThemeAndStoreProvider(
        <RnaMonomerSection
          items={rnaMonomersMock}
          selectItem={selectItemMock}
        />
      )
    );

    expect(selectItemMock).toHaveBeenCalledWith({
      Sugar: 'R',
      Nucleobase: 'A',
      Phosphate: 'P',
    });

    initialMonomers.forEach((monomer) => {
      fireEvent.click(screen.getByText(monomer));
      expect(selectItemMock).toHaveBeenCalledWith(monomer);
    });
  });

  it('should pass correct arg to callback function after changing monomer', () => {
    render(
      withThemeAndStoreProvider(
        <RnaMonomerSection
          items={rnaMonomersMock}
          selectItem={selectItemMock}
        />
      )
    );

    // nucleotides
    let selectedMonomer = screen.getByText('U');
    fireEvent.click(selectedMonomer);
    expect(selectItemMock).toHaveBeenCalledWith({
      Sugar: 'R',
      Nucleobase: 'U',
      Phosphate: 'P',
    });

    // sugar
    const sugarButton = screen.getByText('R');
    fireEvent.click(sugarButton);
    selectedMonomer = screen.getByText('m');
    fireEvent.click(selectedMonomer);
    expect(selectItemMock).toHaveBeenCalledWith('m');
  });
});
