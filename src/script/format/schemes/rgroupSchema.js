const rgroupLogic = {
  title: 'RGroupLogic',
  type: 'object',
  required: ['number'],
  properties: {
    number: {
      type: 'number'
    },
    range: {
      title: 'Occurrence',
      type: 'string',
      maxLength: 50,
      default: ''
    },
    resth: {
      title: 'RestH',
      type: 'boolean',
      default: false
    },
    ifthen: {
      title: 'Condition',
      type: 'integer',
      minimum: 0,
      default: 0
    }
  }
}

const rgroupSchema = {
  id: '/RGroup',
  type: 'object',
  allOf: [
    {
      required: ['type'],
      properties: {
        type: { enum: ['rgroup'] },
        rlogic: { $ref: '#/logic' }
      }
    },
    { $ref: '/Molecule' }
  ],

  logic: rgroupLogic
}

export default rgroupSchema
