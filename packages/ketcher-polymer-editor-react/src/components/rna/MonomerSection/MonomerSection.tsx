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
import { Switcher } from 'components/rna/Switcher'
import { useState } from 'react'
import Button from '@mui/material/Button'
import { MonomerItemType } from 'components/monomerLibrary/monomerLibraryItem/MonomerItem'
import { css } from '@emotion/react'
import { useTheme } from '@mui/material'
import { Group, MonomerList } from 'components/monomerLibrary'

const ResetButton = ({ onClick }) => {
  const theme = useTheme()
  const styles = css`
    margin-left: auto;
    height: 15px;
    color: ${theme.color.button.reset};
    font-size: ${theme.font.size.regular};
    min-width: 30px;
    text-transform: none;
    :hover {
      background-color: unset;
    }
  `
  return (
    <Button variant="text" css={styles} onClick={onClick}>
      Reset
    </Button>
  )
}

type selectedMonomersType = {
  Sugar: string
  Nucleobase: string
  Phosphate: string
}

type splitNucleotideType = (nucleotide: MonomerItemType) => selectedMonomersType

interface MonomerSectionProps {
  onItemClick: () => void
  rnaMonomers: {
    Nucleotide: Array<Group>
    Nucleobase: Array<Group>
    Sugar: Array<Group>
    Phosphate: Array<Group>
  }
}

const MonomerSection = ({ onItemClick, rnaMonomers }: MonomerSectionProps) => {
  const splitNucleotide: splitNucleotideType = (nucleotide) => {
    // TODO: replace function implementation after setup data contract
    const itemMonomers = nucleotide.name?.split('') || []
    return Object.keys(selectedMonomers).reduce((acc, currentValue, index) => {
      acc[currentValue] = itemMonomers[index]
      return acc
    }, {} as selectedMonomersType)
  }

  const [selectedMonomers, setSelectedMonomers] =
    useState<selectedMonomersType>({
      Sugar: 'R',
      Nucleobase: 'A',
      Phosphate: 'P'
    })
  const [activeMonomerType, setActiveMonomerType] = useState('Nucleotide')

  const onReset = () => {
    setActiveMonomerType('Nucleotide')
    setSelectedMonomers({
      Sugar: 'R',
      Nucleobase: 'A',
      Phosphate: 'P'
    })
  }

  const selectMonomer = (item) => {
    let updateValue = {}
    if (activeMonomerType === 'Nucleotide') {
      updateValue = splitNucleotide(item)
      setSelectedMonomers(updateValue as selectedMonomersType)
    } else {
      updateValue[activeMonomerType] = item.label
      setSelectedMonomers((prevState) => {
        return {
          ...prevState,
          ...updateValue
        }
      })
    }
    onItemClick()
  }

  return (
    <>
      <Switcher
        selectedMonomers={Object.values(selectedMonomers)}
        setActiveMonomerType={setActiveMonomerType}
      />
      <ResetButton onClick={onReset} />
      <MonomerList
        list={rnaMonomers[activeMonomerType]}
        onItemClick={selectMonomer}
      />
    </>
  )
}
export { MonomerSection }
