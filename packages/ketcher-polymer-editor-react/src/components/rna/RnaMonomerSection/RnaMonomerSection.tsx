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
import { useEffect, useState } from 'react'
import { MonomerList } from '../../monomerLibrary/monomerLibraryList'
import { MONOMER_TYPES } from '../../../constants'
import { Group } from '../../monomerLibrary/monomerLibraryList/types'

type selectedMonomersType = {
  Sugar: string
  Nucleobase: string
  Phosphate: string
}

export interface MonomerSectionProps {
  selectItem: (item) => void
  items: {
    Nucleotide: Array<Group>
    Nucleobase: Array<Group>
    Sugar: Array<Group>
    Phosphate: Array<Group>
  }
}

const getInitialMonomers = (items) => {
  return items.Nucleotide[0].groupItems[0].monomers as selectedMonomersType
}

const RnaMonomerSection = ({ selectItem, items }: MonomerSectionProps) => {
  const [selectedMonomers, setSelectedMonomers] =
    useState<selectedMonomersType>(getInitialMonomers(items))
  const [activeMonomerType, setActiveMonomerType] = useState('Nucleotide')
  useEffect(() => {
    const matchMonomerByType =
      activeMonomerType === 'Nucleotide'
        ? selectedMonomers
        : selectedMonomers[activeMonomerType]
    selectItem(matchMonomerByType)
  }, [selectItem, activeMonomerType, selectedMonomers])

  const selectMonomerType = (type) => {
    if (type === 'reset') {
      setActiveMonomerType('Nucleotide')
      setSelectedMonomers(getInitialMonomers(items))
    } else {
      setActiveMonomerType(type)
    }
  }

  const selectMonomer = (item) => {
    if (activeMonomerType === 'Nucleotide') {
      setSelectedMonomers(item.monomers)
    } else {
      setSelectedMonomers((prevState) => {
        return {
          ...prevState,
          [activeMonomerType]: item.label
        }
      })
    }
  }

  return (
    <>
      <Switcher
        selectedMonomers={Object.values(selectedMonomers)}
        setActiveMonomerType={selectMonomerType}
      />
      <MonomerList
        libraryName={MONOMER_TYPES.RNA}
        onItemClick={selectMonomer}
      />
    </>
  )
}
export { RnaMonomerSection }
