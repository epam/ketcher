const headerSchema = {
  title: 'Header',
  type: 'object',
  properties: {
    moleculeName: {
      title: 'Molecule name',
      type: 'string',
      default: ''
    },
    creatorProgram: {
      title: 'Creator program',
      type: 'string'
    },
    comment: {
      title: 'Comment',
      type: 'string'
    }
  }
}

const rootSchema = {
  id: '/Root',
  required: ['nodes'],
  properties: {
    nodes: {
      type: 'array',
      items: {
        oneOf: [
          { $ref: '/RxnPlus' },
          { $ref: '/RxnArrow' },
          {
            type: 'object',
            required: ['$ref'],
            properties: {
              $ref: {
                type: 'string'
              }
            }
          }
        ]
      }
    },
    edges: {
      type: 'array',
      items: {
        oneOf: [
          {
            properties: {
              $refs: {
                type: 'array',
                maxItems: 2,
                items: {
                  type: 'string'
                }
              }
            }
          }
          // ...
        ]
      }
    }
  }
}

const graphSchema = {
  id: '/Graph',
  type: 'object',
  required: ['root'],
  properties: {
    header: { $ref: '#/header' },
    root: { $ref: '#/root' }
  },
  patternProperties: {
    '^mol': { $ref: '/Molecule' },
    '^rg': { $ref: '/RGroup' }
  },

  root: rootSchema,
  header: headerSchema
}

export default graphSchema
