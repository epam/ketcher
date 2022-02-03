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
import { MonomerItemType } from './monomerLibraryItem'
import { Tabs } from 'components/shared/ui/Tabs'
import styled from '@emotion/styled'
import { RnaMonomerSection } from 'components/rna/MonomerSection'
import { MonomerGroup } from './monomerLibraryGroup'

export type Group = {
  groupItems: Array<MonomerItemType>
  groupTitle?: string
}

interface MonomerListProps {
  list: Array<Group>
  onItemClick: (item) => void
}

const monomerItemHandleClick = () => {
  console.log('callback for monomer item')
}

const MonomerList = ({ list, onItemClick }: MonomerListProps) => {
  return (
    <>
      {list.map(({ groupTitle, groupItems }, key) => {
        return (
          <MonomerGroup
            key={key}
            title={groupTitle}
            items={groupItems}
            onItemClick={onItemClick}
          />
        )
      })}
    </>
  )
}

const MonomerLibrary = () => {
  const tabs = [
    {
      caption: '✩',
      component: () => <></>
    },
    {
      caption: 'Peptides',
      component: MonomerList,
      props: {
        list: [
          {
            groupItems: [
              { label: 'P' },
              { label: 'vfvv' },
              { label: 'qswsx' },
              { label: 'Mesk' }
            ]
          }
        ],
        onItemClick: monomerItemHandleClick
      }
    },
    {
      caption: 'RNA',
      component: RnaMonomerSection,
      props: {
        items: {
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
                  label: 'C',
                  monomers: {
                    Sugar: 'R',
                    Nucleobase: 'C',
                    Phosphate: 'P'
                  }
                },
                {
                  label: 'G',
                  monomers: {
                    Sugar: 'R',
                    Nucleobase: 'G',
                    Phosphate: 'P'
                  }
                },
                {
                  label: 'T',
                  monomers: {
                    Sugar: 'R',
                    Nucleobase: 'T',
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
              groupItems: [
                { label: 'A' },
                { label: '2ldg' },
                { label: '4skmc' },
                { label: '7jds' },
                { label: 'dc' }
              ],
              groupTitle: 'A'
            },
            {
              groupItems: [
                { label: 'C' },
                { label: '5dvd' },
                { label: '9dkvj' },
                { label: 'sd6' },
                { label: 'dsa' }
              ],
              groupTitle: 'C'
            }
          ],
          Sugar: [
            {
              groupItems: [
                { label: 'R' },
                { label: 'm' },
                { label: 'd' },
                { label: 'ar' },
                { label: 'Ld' }
              ]
            }
          ],
          Phosphate: [
            {
              groupItems: [
                { label: 'p' },
                { label: '36dcd' },
                { label: 'bnn' },
                { label: 'bp' },
                { label: 'me' }
              ]
            }
          ]
        },
        selectItem: (item) => console.log(item)
      }
    },
    {
      caption: 'CHEM',
      component: () => <></>
    }
  ]

  const MonomerLibraryContainer = styled.div(({ theme }) => ({
    width: '253px',
    height: '100%',
    backgroundColor: theme.color.background.primary
  }))

  return (
    <MonomerLibraryContainer>
      <Tabs tabs={tabs} />
    </MonomerLibraryContainer>
  )
}

export { MonomerLibrary, MonomerList }
