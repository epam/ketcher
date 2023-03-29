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

export type GenItem = {
  label: string
  description?: string
}

export type GenItemSet = {
  items: GenItem[]
  displayName?: string
}

export type GenGroup = {
  itemSets: GenItemSet[]
  title: string
}

export type GenericsType = {
  [index: string]: GenGroup & { subGroups?: GenericsType }
}

export const Generics: GenericsType = {
  'atoms-gen': {
    title: 'Atom Generics',
    itemSets: [
      {
        displayName: 'any atom',
        items: [
          { label: 'A', description: 'Any atom except hydrogen' },
          { label: 'AH', description: 'Any atom, including hydrogen' }
        ]
      },
      {
        displayName: 'except C or H',
        items: [
          {
            label: 'Q',
            description: 'Any heteroatom (any atom except C or H)'
          },
          { label: 'QH', description: 'Any atom except C' }
        ]
      },
      {
        displayName: 'any metal',
        items: [
          { label: 'M', description: 'Any metal' },
          { label: 'MH', description: 'Any metal or hydrogen' }
        ]
      },
      {
        displayName: 'any halogen',
        items: [
          { label: 'X', description: 'Any halogen' },
          { label: 'XH', description: 'Any halogen or hydrogen' }
        ]
      }
    ]
  },
  'special-nodes': {
    title: 'Special Nodes',
    itemSets: [
      {
        items: [
          { label: 'H+', description: 'Proton' },
          { label: 'D', description: 'Deuterium' },
          { label: 'T', description: 'Tritium' },
          { label: 'R', description: 'Pseudoatom' },
          { label: 'Pol', description: 'Polymer Bead' }
        ]
      }
    ]
  },

  'group-gen': {
    title: 'Group Generics',
    itemSets: [
      {
        items: [
          {
            label: 'G',
            description: 'Any group'
          },
          {
            label: 'GH',
            description: 'Any group or hydrogen'
          }
        ]
      },
      {
        items: [
          {
            label: 'G*',
            description: 'Any group with a ring closure'
          },
          {
            label: 'GH*',
            description: 'Any group with a ring closure or hydrogen'
          }
        ]
      }
    ],
    subGroups: {
      'group-acyclic': {
        title: 'Acyclic',
        itemSets: [
          {
            items: [
              { label: 'ACY', description: 'Acyclic group' },
              { label: 'ACH', description: 'Acyclic group or hydrogen' }
            ]
          }
        ],
        subGroups: {
          'acyclic-carbo': {
            title: 'Acyclic Carbo',
            itemSets: [
              {
                items: [
                  { label: 'ABC', description: 'Carbocyclic' },
                  { label: 'ABH', description: 'Carbocyclic of hydrogen' }
                ]
              },
              {
                displayName: 'alkynyl',
                items: [
                  { label: 'AYL', description: 'Alkynyl' },
                  { label: 'AYH', description: 'Alkynyl or hydrogen' }
                ]
              },
              {
                displayName: 'alkyl',
                items: [
                  { label: 'ALK', description: 'Alkyl' },
                  { label: 'ALH', description: 'Alkyl or hydrogen' }
                ]
              },
              {
                displayName: 'alkenyl',
                items: [
                  { label: 'AEL', description: 'Alkenyl' },
                  { label: 'AEH', description: 'Alkenyl or hydrogen' }
                ]
              }
            ]
          },
          'acyclic-hetero': {
            title: 'Acyclic Hetero',
            itemSets: [
              {
                items: [
                  { label: 'AHC', description: 'Heteroacyclic' },
                  { label: 'AHH', description: 'Heterocyclic or hydrogen' }
                ]
              },
              {
                items: [
                  { label: 'AOX', description: 'Alkoxy' },
                  { label: 'AOH', description: 'Alkoxy or hydrogen' }
                ]
              }
            ]
          }
        }
      },
      'group-cyclic': {
        title: 'Cyclic',
        itemSets: [
          {
            items: [
              { label: 'CYC', description: 'Cyclic group' },
              { label: 'CYH', description: 'Cyclic group or hydrogen' }
            ]
          },
          {
            displayName: 'no carbon',
            items: [
              {
                label: 'CXX',
                description: 'Cyclic group with no Carbon atoms'
              },
              {
                label: 'CXH',
                description: 'Cyclic group with no Carbon atoms or hydrogen'
              }
            ]
          }
        ],
        subGroups: {
          'cyclic-carbo': {
            title: 'Cyclic Carbo',
            itemSets: [
              {
                items: [
                  { label: 'CBC', description: 'Carbocyclic derivatives' },
                  {
                    label: 'CBH',
                    description: 'Carbocyclic derivatives or hydrogen'
                  }
                ]
              },
              {
                displayName: 'aryl',
                items: [
                  { label: 'ARY', description: 'Any aryl group' },
                  { label: 'ARH', description: 'Any aryl group or hydrogen' }
                ]
              },
              {
                displayName: 'cycloalkyl',
                items: [
                  { label: 'CAL', description: 'Any cycloalkyl group' },
                  {
                    label: 'CAH',
                    description: 'Any cycloalkyl group or hydrogen'
                  }
                ]
              },
              {
                displayName: 'cycloalkenyl',
                items: [
                  { label: 'CEL', description: 'Any cyloalkenyl group' },
                  {
                    label: 'CEH',
                    description: 'Any cyloalkenyl group or hydrogen'
                  }
                ]
              }
            ]
          },
          'cyclic-hetero': {
            title: 'Cyclic Hetero',
            itemSets: [
              {
                items: [
                  { label: 'CHC', description: 'Heterocyclic group' },
                  {
                    label: 'CHH',
                    description: 'Heterocyclic group or hydrogen'
                  }
                ]
              },
              {
                displayName: 'hetero aryl',
                items: [
                  { label: 'HAR', description: 'Heteroaryl group' },
                  { label: 'HAH', description: 'Heteroaryl group or hydrogen' }
                ]
              }
            ]
          }
        }
      }
    }
  }
}
