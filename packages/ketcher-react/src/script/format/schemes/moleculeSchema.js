const atom = {
  title: 'Atom',
  type: 'object',
  required: ['label', 'location'],
  properties: {
    label: {
      title: 'Label',
      type: 'string',
      maxLength: 3
    },
    alias: {
      title: 'Alias',
      type: 'string'
    },
    location: {
      title: 'Location',
      type: 'array',
      items: {
        type: 'float',
        precision: 1
      }
    },
    rgroups: {
      title: 'Rgroups',
      type: 'array',
      items: {
        type: 'integer'
      }
    },
    charge: {
      title: 'Charge',
      type: 'integer',
      minimum: -1000,
      maximum: 1000,
      default: 0
    },
    explicitValence: {
      title: 'Valence',
      enum: [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      enumNames: [
        'Not specified',
        '0',
        'I',
        'II',
        'III',
        'IV',
        'V',
        'VI',
        'VII',
        'VIII',
        'IX',
        'X',
        'XI',
        'XII'
      ],
      default: -1
    },
    isotope: {
      title: 'Isotope',
      type: 'integer',
      minimum: 0,
      default: 0
    },
    radical: {
      title: 'Radical',
      enum: [0, 2, 1, 3],
      enumNames: [
        'Not specified',
        'Monoradical',
        'Diradical (singlet)',
        'Diradical (triplet)'
      ],
      default: 0
    },
    attachmentPoints: {
      title: 'Rgroup attachment points',
      enum: [0, 1, 2, 3],
      enumNames: [
        'No',
        'First site only',
        'Second site only',
        'First and second site'
      ],
      default: 0
    },
    // stereo
    stereoLabel: {
      title: 'Stereo label',
      type: ['string', 'null'],
      pattern: /(^abs)|(^and)|(^or)/,
      default: null
    },
    stereoParity: {
      title: 'Stereo parity configuration',
      enum: [0, 1, 2, 3],
      enumNames: ['none', 'odd parity', 'even parity', 'either parity'],
      default: 0
    },
    weight: {
      title: 'Atomic weight',
      type: 'integer',
      default: 0
    },
    // query
    ringBondCount: {
      title: 'Ring bond count',
      enum: [0, -2, -1, 2, 3, 4],
      enumNames: ['', 'As drawn', '0', '2', '3', '4'],
      default: 0
    },
    substitutionCount: {
      title: 'Substitution count',
      enum: [0, -2, -1, 1, 2, 3, 4, 5, 6],
      enumNames: [
        'Not specified',
        'As drawn',
        '0',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6'
      ],
      default: 0
    },
    unsaturatedAtom: {
      title: 'Unsaturated',
      type: 'boolean',
      default: false
    },
    hCount: {
      title: 'H count',
      enum: [-1, 0, 1, 2, 3, 4, 5],
      enumNames: ['Zero', 'Not specified', 'H0', 'H1', 'H2', 'H3', 'H4'],
      default: 0
    },
    // reaction
    mapping: {
      title: 'Atom-atom mapping',
      type: 'integer',
      default: 0
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

const rgatom = {
  title: 'RGroup-atom',
  type: 'object',
  required: ['type', 'location'],
  properties: {
    type: {
      enum: ['rg-label']
    },
    location: {
      title: 'Location',
      type: 'array',
      items: {
        type: 'float',
        precision: 1
      }
    },
    $refs: {
      // RGroups in root of Graph (only one: `$refs` or `rgroups`)
      type: 'array',
      items: {
        type: 'string',
        pattern: '^rg-',
        maxLength: 5
      }
    },
    rgroups: {
      // inline Rgroups in atom (only one: `$refs` or `rgroups`)
      type: 'array',
      items: { $ref: '/RGroup' }
    },
    attachmentPoints: {
      title: 'Rgroup attachment points',
      enum: [0, 1, 2, 3],
      enumNames: [
        'No',
        'First site only',
        'Second site only',
        'First and second site'
      ],
      default: 0
    }
  }
}

const atomlist = {
  title: 'RGroup-atom',
  type: 'object',
  required: ['type', 'location'],
  properties: {
    type: {
      enum: ['atom-list']
    },
    notList: {
      type: 'boolean',
      default: false
    },
    location: {
      title: 'Location',
      type: 'array',
      items: {
        type: 'float',
        precision: 1
      }
    },
    elements: {
      type: 'array',
      minItems: 2,
      items: {
        type: 'string',
        maxLength: 3
      }
    },
    attachmentPoints: {
      title: 'Rgroup attachment points',
      enum: [0, 1, 2, 3],
      enumNames: [
        'No',
        'First site only',
        'Second site only',
        'First and second site'
      ],
      default: 0
    }
  }
}

const bond = {
  title: 'Bond',
  type: 'object',
  required: ['atoms'],
  properties: {
    type: {
      title: 'Type',
      enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
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
        'Single/Double',
        'Single/Aromatic',
        'Double/Aromatic'
      ],
      default: 1
    },
    atoms: {
      title: 'Atoms',
      type: 'array',
      minItems: 2,
      maxItems: 2,
      items: {
        type: 'integer'
      }
    },
    stereo: {
      title: 'Bond stereo configuration',
      enum: [0, 1, 2, 3],
      enumNames: ['None', 'Up', 'Either', 'Down'],
      default: 0
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
    },
    stereobox: {
      title: 'Stereo box',
      enum: [0, 1],
      default: 0
    }
  }
}

const sgroup = {
  title: 'SGroup',
  allOf: [
    {
      required: ['atoms'],
      properties: {
        atoms: {
          type: 'array'
        }
      }
    },
    {
      oneOf: [
        {
          key: 'GEN',
          title: 'Generic',
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
              maximum: 1000
            }
          },
          required: ['mul']
        },
        {
          key: 'SRU',
          title: 'SRU polymer',
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
              enum: ['HT', 'HH', 'EU'],
              enumNames: ['Head-to-tail', 'Head-to-head', 'Either unknown'],
              default: 'ht'
            }
          },
          required: ['subscript', 'connectivity']
        },
        {
          key: 'SUP',
          title: 'Superatom',
          properties: {
            type: { enum: ['SUP'] },
            name: {
              title: 'Name',
              type: 'string',
              default: '',
              minLength: 1,
              invalidMessage: 'Please, provide a name for the superatom'
            }
          }
        },
        {
          key: 'DAT',
          title: 'Data-group',
          properties: {
            type: { enum: ['DAT'] },
            context: {
              title: 'Context',
              enum: ['Fragment', 'Multifragment', 'Bond', 'Atom', 'Group'],
              default: 'Fragment'
            },
            fieldName: {
              title: 'Field name',
              type: 'string',
              default: '',
              minLength: 1,
              invalidMessage: 'Please, specify field name'
            },
            fieldValue: {
              title: 'Field value',
              type: 'string',
              default: '',
              minLength: 1,
              invalidMessage: 'Please, specify field value'
            },
            display: {
              title: 'Display',
              type: 'boolean',
              default: false
            },
            placement: {
              title: 'Placement',
              type: 'boolean',
              default: true
            }
          },
          required: ['context', 'fieldName', 'fieldValue']
        }
      ]
    }
  ]
}

const moleculeSchema = {
  id: '/Molecule',
  type: 'object',
  properties: {
    stereoFlag: {
      title: 'Stereo Flag',
      type: ['string', null],
      enum: [null, 'ABS', 'AND', 'OR', 'Mixed'],
      default: null
    },
    atoms: {
      title: 'Atoms',
      type: 'array',
      items: {
        oneOf: [
          { $ref: '#/atom' },
          { $ref: '#/rgatom' },
          { $ref: '#/atomlist' }
        ]
      }
    },
    bonds: {
      title: 'Bonds',
      type: 'array',
      items: { $ref: '#/bond' }
    },
    sgroups: {
      title: 'SGroups',
      type: 'array',
      items: { $ref: '#/sgroup' }
    }
  },

  atom,
  atomlist,
  rgatom,
  bond,
  sgroup
}

export default moleculeSchema
