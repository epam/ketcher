import { AtomList } from 'domain/entities/atomList'

const ids = [66, 44, 12, 88]
const params = { notList: false, ids }

describe('labelList', () => {
  it('should return array of elements labels', () => {
    const atomList = new AtomList(params)

    expect(atomList.labelList()).toStrictEqual(['Dy', 'Ru', 'Mg', 'Ra'])
  })
})

describe('label', () => {
  it('should return list', () => {
    const atomList = new AtomList(params)

    expect(atomList.label()).toBe('[Dy,Ru,Mg,Ra]')
  })

  it('should return not list', () => {
    const atomList = new AtomList({ ...params, notList: true })

    expect(atomList.label()).toBe('![Dy,Ru,Mg,Ra]')
  })
})
describe('equals', () => {
  it.each([false, true])('should return true', (notList) => {
    const atomList = new AtomList({ ...params, notList })
    const dataWithReverseIds = { notList, ids: params.ids.sort().reverse() }
    const atomList2 = new AtomList(dataWithReverseIds)

    expect(atomList.equals(atomList2)).toBeTruthy()
  })

  it('should return false', () => {
    const atomList = new AtomList(params)
    const dataWithReverseIds = {
      notList: true,
      ids: params.ids.sort().reverse()
    }
    const atomList2 = new AtomList(dataWithReverseIds)

    expect(atomList.equals(atomList2)).toBeFalsy()
  })
})
