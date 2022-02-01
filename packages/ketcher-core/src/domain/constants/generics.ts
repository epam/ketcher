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

export type Item = {
  label: string
  description?: string
}

export type ItemSet = {
  items: Item[]
  displayName?: string
}

export type GenGroup = {
  itemSets: ItemSet[]
  title: string
}

export type GenericsType = {
  [index: string]: GenGroup & { subGroups?: GenericsType }
}

export const Generics: GenericsType = {
  'atoms-gen': {
    title: 'Atom Generics',
    itemSets: [
      { displayName: 'any atom', items: [{ label: 'A' }, { label: 'AH' }] },
      {
        displayName: 'except C or H',
        items: [{ label: 'Q' }, { label: 'QH' }]
      },
      { displayName: 'any metal', items: [{ label: 'M' }, { label: 'MH' }] },
      { displayName: 'any halogen', items: [{ label: 'X' }, { label: 'XH' }] }
    ]
  },
  'special-nodes': {
    title: 'Special Nodes',
    itemSets: [
      {
        items: [
          { label: 'H+' },
          { label: 'D' },
          { label: 'T' },
          { label: 'T' },
          { label: 'R' },
          { label: 'Pol' }
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
            label: 'G'
          },
          {
            label: 'GH'
          }
        ]
      },
      {
        items: [
          {
            label: 'G*'
          },
          {
            label: 'GH*'
          }
        ]
      }
    ],
    subGroups: {
      'group-acyclic': {
        title: 'Acyclic',
        itemSets: [{ items: [{ label: 'ACY' }, { label: 'ACH' }] }],
        subGroups: {
          'acyclic-carbo': {
            title: 'Acyclic Carbo',
            itemSets: [
              { items: [{ label: 'ABC' }, { label: 'ABH' }] },
              {
                displayName: 'alkynyl',
                items: [{ label: 'AYL' }, { label: 'AYH' }]
              },
              {
                displayName: 'alkyl',
                items: [{ label: 'ALK' }, { label: 'ALH' }]
              },
              {
                displayName: 'alkenyl',
                items: [{ label: 'AEL' }, { label: 'AEH' }]
              }
            ]
          },
          'acyclic-hetero': {
            title: 'Acyclic Hetero',
            itemSets: [
              { items: [{ label: 'AHC' }, { label: 'AHH' }] },
              { items: [{ label: 'AOX' }, { label: 'AOH' }] }
            ]
          }
        }
      },
      'group-cyclic': {
        title: 'Cyclic',
        itemSets: [
          { items: [{ label: 'CYC' }, { label: 'CYH' }] },
          {
            displayName: 'no carbon',
            items: [{ label: 'CXX' }, { label: 'CXH' }]
          }
        ],
        subGroups: {
          'cyclic-carbo': {
            title: 'Cyclic Carbo',
            itemSets: [
              { items: [{ label: 'CBC' }, { label: 'CBH' }] },
              {
                displayName: 'atyl',
                items: [{ label: 'ARY' }, { label: 'ARH' }]
              },
              {
                displayName: 'cycloalkyl',
                items: [{ label: 'CAL' }, { label: 'CAH' }]
              },
              {
                displayName: 'cycloalkenyl',
                items: [{ label: 'CEL' }, { label: 'CEH' }]
              }
            ]
          },
          'cyclic-hetero': {
            title: 'Cyclic Hetero',
            itemSets: [
              { items: [{ label: 'CHC' }, { label: 'CHH' }] },
              {
                displayName: 'hetero aryl',
                items: [{ label: 'HAR' }, { label: 'HAH' }]
              }
            ]
          }
        }
      }
    }
  },
  'group-gene': {
    itemSets: [
      {
        items: [
          {
            label: 'G'
          },
          {
            label: 'GH'
          },
          {
            label: 'aw'
          }
        ]
      }
    ],
    title: 'Some other group'
  }
}
