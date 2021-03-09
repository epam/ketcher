export const plusSchema = {
  id: '/RxnPlus',
  type: 'object',
  required: ['type', 'location'],
  properties: {
    type: {
      enum: ['plus']
    },
    location: {
      type: 'array',
      items: {
        type: 'float',
        precision: 1
      }
    },
    prop: {
      type: 'object'
    }
  }
}

export const arrowSchema = {
  id: '/RxnArrow',
  type: 'object',
  required: ['type', 'location'],
  properties: {
    type: {
      enum: ['arrow']
    },
    location: {
      type: 'array',
      items: {
        type: 'float',
        precision: 1
      }
    },
    prop: {
      type: 'object'
    },
    mode: {
      enum: ['simple', 'equilibrium']
    }
  }
}
