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

import { mapOf } from './schema-helper'
import { range } from 'lodash/fp'

export const atom = {
  title: 'Atom',
  type: 'object',
  required: ['label'],
  properties: {
    label: {
      title: 'Label',
      type: 'string', // TODO:should really be enum of elements
      maxLength: 3,
      invalidMessage: 'Wrong label'
    },
    alias: {
      title: 'Alias',
      type: 'string',
      invalidMessage: 'Leading and trailing spaces are not allowed'
    },
    charge: {
      title: 'Charge',
      type: 'string',
      pattern: '^([+-]?)([0-9]{1,3}|1000)([+-]?)$',
      maxLength: 5,
      default: '0',
      invalidMessage: 'Invalid charge value'
    },
    explicitValence: {
      title: 'Valence',
      enum: [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8],
      enumNames: ['', '0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'],
      default: -1
    },
    isotope: {
      title: 'Isotope',
      type: 'integer',
      minimum: 0,
      default: 0,
      invalidMessage: 'There must be integer'
    },
    radical: {
      title: 'Radical',
      enum: [0, 2, 1, 3],
      enumNames: [
        '',
        'Monoradical',
        'Diradical (singlet)',
        'Diradical (triplet)'
      ],
      default: 0
    },
    ringBondCount: {
      title: 'Ring bond count',
      enum: [0, -2, -1, 2, 3, 4],
      enumNames: ['', 'As drawn', '0', '2', '3', '4'],
      default: 0
    },
    hCount: {
      title: 'H count',
      enum: [0, 1, 2, 3, 4, 5],
      enumNames: ['', '0', '1', '2', '3', '4'],
      default: 0
    },
    substitutionCount: {
      title: 'Substitution count',
      enum: [0, -2, -1, 1, 2, 3, 4, 5, 6],
      enumNames: ['', 'As drawn', '0', '1', '2', '3', '4', '5', '6'],
      default: 0
    },
    unsaturatedAtom: {
      title: 'Unsaturated',
      type: 'boolean',
      default: false
    },
    invRet: {
      title: 'Inversion',
      enum: [0, 1, 2],
      enumNames: ['', 'Inverts', 'Retains'],
      default: 0
    },
    exactChangeFlag: {
      title: 'Exact change',
      type: 'boolean',
      default: false
    }
  }
}

export const rgroupSchema = {
  title: 'R-group',
  type: 'object',
  properties: {
    values: {
      type: 'array',
      items: {
        type: 'string',
        enum: range(1, 33),
        enumNames: range(1, 33).map((item) => 'R' + item)
      }
    }
  }
}

export const labelEdit = {
  title: 'Label Edit',
  type: 'object',
  required: ['label'],
  properties: {
    label: {
      title: 'Atom',
      default: '',
      invalidMessage: 'Wrong atom symbol',
      type: 'string'
    }
  }
}

export const attachmentPoints = {
  title: 'Attachment Points',
  type: 'object',
  properties: {
    primary: {
      title: 'Primary attachment point',
      type: 'boolean'
    },
    secondary: {
      title: 'Secondary attachment point',
      type: 'boolean'
    }
  }
}

export const bond = {
  title: 'Bond',
  type: 'object',
  required: ['type'],
  properties: {
    type: {
      title: 'Type',
      enum: [
        'single',
        'up',
        'down',
        'updown',
        'double',
        'crossed',
        'triple',
        'aromatic',
        'any',
        'hydrogen',
        'singledouble',
        'singlearomatic',
        'doublearomatic',
        'dative'
      ],
      enumNames: [
        'Single',
        'Single Up',
        'Single Down',
        'Single Up/Down',
        'Double',
        'Double Cis/Trans',
        'Triple',
        'Aromatic',
        'Any',
        'Hydrogen',
        'Single/Double',
        'Single/Aromatic',
        'Double/Aromatic',
        'Dative'
      ],
      default: 'single'
    },
    topology: {
      title: 'Topology',
      enum: [0, 1, 2],
      enumNames: ['Either', 'Ring', 'Chain'],
      default: 0
    },
    center: {
      title: 'Reacting Center',
      enum: [0, -1, 1, 2, 4, 8, 12], // 5, 9, 13
      enumNames: [
        'Unmarked',
        'Not center',
        'Center',
        'No change',
        'Made/broken',
        'Order changes',
        'Made/broken and changes'
      ], // "Order changes" x 3
      default: 0
    }
  }
}

const sgroup = {
  title: 'SGroup',
  type: 'object',
  required: ['type'],
  oneOf: [
    {
      key: 'GEN',
      title: 'Generic',
      type: 'object',
      properties: {
        type: { enum: ['GEN'] }
      }
    },
    {
      key: 'MUL',
      title: 'Multiple group',
      type: 'object',
      properties: {
        type: { enum: ['MUL'] },
        mul: {
          title: 'Repeat count',
          type: 'integer',
          default: 1,
          minimum: 1,
          maximum: 1000,
          invalidMessage: 'Value out of range: must be between 1 and 1000'
        }
      },
      required: ['mul']
    },
    {
      key: 'SRU',
      title: 'SRU polymer',
      type: 'object',
      properties: {
        type: { enum: ['SRU'] },
        subscript: {
          title: 'Polymer label',
          type: 'string',
          default: 'n',
          pattern: '^[a-zA-Z]$',
          invalidMessage: 'SRU subscript should consist of a single letter'
        },
        connectivity: {
          title: 'Repeat Pattern',
          enum: ['ht', 'hh', 'eu'],
          enumNames: ['Head-to-tail', 'Head-to-head', 'Either unknown'],
          default: 'ht'
        }
      },
      required: ['subscript', 'connectivity']
    },
    {
      key: 'SUP',
      title: 'Superatom',
      type: 'object',
      properties: {
        type: { enum: ['SUP'] },
        name: {
          title: 'Name',
          type: 'string',
          default: '',
          minLength: 1,
          invalidMessage: 'Please, provide a name for the superatom'
        }
      },
      required: ['name']
    }
  ]
}
export const sgroupMap = mapOf(sgroup, 'type')

export const rgroupLogic = {
  title: 'R-Group',
  type: 'object',
  properties: {
    range: {
      title: 'Occurrence',
      type: 'string',
      maxLength: 50,
      invalidMessage: 'Wrong value'
    },
    resth: {
      title: 'RestH',
      type: 'boolean'
    },
    ifthen: {
      title: 'Condition',
      type: 'integer',
      minium: 0
    }
  }
}

export const textSchema = {
  title: 'Text Edit',
  type: 'object',
  required: ['label'],
  properties: {
    label: {
      default: '',
      type: 'string'
    }
  }
}

export const attachSchema = {
  title: 'Template edit',
  type: 'object',
  required: ['name'],
  properties: {
    name: {
      title: 'Molecule name',
      type: 'string',
      minLength: 1,
      maxLength: 128,
      invalidMessage:
        'Template must have a unique name and no more than 128 symbols in length'
    }
  }
}
