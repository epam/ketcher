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

import { MonomerItem } from './monomerLibraryItem/MonomerItem'
import { Tabs } from 'components/shared/ui/Tabs'
import { Switcher } from 'components/rna/Switcher'
import styled from '@emotion/styled'

interface MonomerListPropTypes {
  list: Array<Record<string, string>>
}

const monomerItemHandleClick = () => {
  console.log('callback for monomer item')
}

const MonomerLibrary = () => {
  const MonomerList = (props: MonomerListPropTypes) => {
    return props.list.map((monomer, key) => {
      return (
        <MonomerItem
          key={key}
          item={monomer}
          onClick={monomerItemHandleClick}
        />
      )
    })
  }

  const tabs = [
    {
      caption: '✩',
      component: MonomerList,
      props: { list: [{ name: 'S' }] }
    },
    {
      caption: 'Peptides',
      component: MonomerList,
      props: { list: [{ name: 'P' }] }
    },
    {
      caption: 'RNA',
      component: Switcher,
      props: {
        selectedMonomers: ['R', 'A', 'P'],
        active: 0, // replace with parent state when integrate
        handleSetActive: (index) => console.log(index) // replace with parent callback when integrate
      }
    },
    {
      caption: 'CHEM',
      component: MonomerList,
      props: {
        list: [
          { name: 'C' },
          { name: 'H' },
          { name: 'E' },
          { name: 'M' },
          { name: 'C' },
          { name: 'H' },
          { name: 'E' },
          { name: 'M' }
        ]
      }
    }
  ]

  const MonomerLibraryContainer = styled.div(({ theme }) => ({
    position: 'absolute',
    width: 'fit-content',
    height: '700px',
    backgroundColor: theme.color.background.primary
  }))

  return (
    <MonomerLibraryContainer>
      <Tabs tabs={tabs} />
    </MonomerLibraryContainer>
  )
}

export { MonomerLibrary }
