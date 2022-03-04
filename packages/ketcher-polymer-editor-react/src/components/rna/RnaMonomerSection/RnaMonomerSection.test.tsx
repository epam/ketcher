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
import { render, screen, fireEvent } from '@testing-library/react'
import { RnaMonomerSection } from './RnaMonomerSection'

describe('RNA Monomer Section', () => {
  const rnaMonomersMock = {
    Nucleotide: [
      {
        groupItems: [
          {
            label: 'A',
            monomers: {
              Sugar: 'R',
              Nucleobase: 'A',
              Phosphate: 'P'
            }
          },
          {
            label: 'U',
            monomers: {
              Sugar: 'R',
              Nucleobase: 'U',
              Phosphate: 'P'
            }
          }
        ],
        groupTitle: 'Nucleotides'
      }
    ],
    Nucleobase: [
      {
        groupItems: [{ label: 'A' }, { label: '2ldg' }],
        groupTitle: 'Nucleobase'
      }
    ],
    Sugar: [
      {
        groupItems: [{ label: 'R' }, { label: 'm' }],
        groupTitle: 'Sugar'
      }
    ],
    Phosphate: [
      {
        groupItems: [{ label: 'p' }, { label: '36dcd' }],
        groupTitle: 'Phosphate'
      }
    ]
  }
  const selectItemMock = jest.fn()
  const initialMonomers = ['R', 'A', 'P']

  it('should correct render with initial values', () => {
    render(
      withThemeProvider(
        <RnaMonomerSection
          items={rnaMonomersMock}
          selectItem={selectItemMock}
        />
      )
    )
    const switcherButtons = screen.getAllByRole('button')
    const tabTitle = screen.getByText('Nucleotides')
    const tabContent = screen.getByText('U')

    expect(switcherButtons.length).toEqual(5)
    expect(tabTitle).toBeInTheDocument()
    expect(tabContent).toBeInTheDocument()
  })

  it('should pass correct initial monomers to switcher', () => {
    render(
      withThemeProvider(
        <RnaMonomerSection
          items={rnaMonomersMock}
          selectItem={selectItemMock}
        />
      )
    )
    const switcherButton = screen.getByText('R(A)P')
    expect(switcherButton).toBeInTheDocument()
  })

  it('should render correct tab when each switcher button selected', () => {
    render(
      withThemeProvider(
        <RnaMonomerSection
          items={rnaMonomersMock}
          selectItem={selectItemMock}
        />
      )
    )

    const sugarButton = screen.getByText('R')
    fireEvent.click(sugarButton)
    const sugarTab = screen.getByText('Sugar')
    expect(sugarTab).toBeInTheDocument()

    const nucleobaseButton = screen.getByText('A')
    fireEvent.click(nucleobaseButton)
    const nucleobaseTab = screen.getByText('Nucleobase')
    expect(nucleobaseTab).toBeInTheDocument()

    const phosphateButton = screen.getByText('P')
    fireEvent.click(phosphateButton)
    const phosphateTab = screen.getByText('Phosphate')
    expect(phosphateTab).toBeInTheDocument()
  })

  it('should pass correct arg to callback function after changing type', () => {
    render(
      withThemeProvider(
        <RnaMonomerSection
          items={rnaMonomersMock}
          selectItem={selectItemMock}
        />
      )
    )

    expect(selectItemMock).toHaveBeenCalledWith({
      Sugar: 'R',
      Nucleobase: 'A',
      Phosphate: 'P'
    })

    initialMonomers.forEach((monomer) => {
      fireEvent.click(screen.getByText(monomer))
      expect(selectItemMock).toHaveBeenCalledWith(monomer)
    })
  })

  it('should pass correct arg to callback function after changing monomer', () => {
    render(
      withThemeProvider(
        <RnaMonomerSection
          items={rnaMonomersMock}
          selectItem={selectItemMock}
        />
      )
    )

    // nucleotides
    let selectedMonomer = screen.getByText('U')
    fireEvent.click(selectedMonomer)
    expect(selectItemMock).toHaveBeenCalledWith({
      Sugar: 'R',
      Nucleobase: 'U',
      Phosphate: 'P'
    })

    // sugar
    const sugarButton = screen.getByText('R')
    fireEvent.click(sugarButton)
    selectedMonomer = screen.getByText('m')
    fireEvent.click(selectedMonomer)
    expect(selectItemMock).toHaveBeenCalledWith('m')
  })
})
