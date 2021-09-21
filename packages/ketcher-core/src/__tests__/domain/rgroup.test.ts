import { Pool, RGroup, RGroupParams } from 'domain/entities'

const rGroupParams: RGroupParams = {
  ifthen: 0,
  resth: false,
  range: ''
}

describe('RGroup', () => {
  describe('findRGroupByFragment static function', () => {
    it('should return null if RGroups is empty', () => {
      const frid = 2
      const rGroups = new Pool()
      expect(RGroup.findRGroupByFragment(rGroups, frid)).toBe(null)
    })

    it('should return null if no value in RGroups', () => {
      const frid = 2
      const rGroups = new Pool()

      const frags = new Set()
      frags.add(1)
      const rGroup = { frags }

      rGroups.add(rGroup)

      expect(RGroup.findRGroupByFragment(rGroups, frid)).toBe(null)
    })

    it('should return RGroup index', () => {
      const frid = 2
      const rGroups = new Pool()

      const frags_1 = new Set()
      frags_1.add(1)
      const rGroup_1 = { frags: frags_1 }
      rGroups.add(rGroup_1)

      const frags_2 = new Set()
      frags_2.add(2)
      const rGroup_2 = { frags: frags_2 }
      rGroups.add(rGroup_2)

      expect(RGroup.findRGroupByFragment(rGroups, frid)).toBe(1)
    })
  })

  describe('getAttrs', () => {
    it('should return RGrpup attributes', () => {
      const rGroup = new RGroup(rGroupParams)

      expect(rGroup.getAttrs()).toStrictEqual(rGroupParams)
    })
  })

  describe('clone', () => {
    it('should return copy of RGroup if do not pass the arguments', () => {
      const rGroup = new RGroup()

      expect(rGroup.clone()).toStrictEqual(rGroup)
    })

    it('should return RGroup clone with new frags values', () => {
      const oldFrags = new Set()
      oldFrags.add(1)
      const newRGroupParams = {
        ...rGroupParams,
        frags: oldFrags
      }
      const rGroup = new RGroup(newRGroupParams)

      const fidMap = new Map()
      fidMap.set(0, 2)

      const cloneFrags = new Set()
      cloneFrags.add(2)
      const cloneRGroupParams = {
        ...rGroupParams,
        frags: cloneFrags
      }
      const cloneRGroup = new RGroup(cloneRGroupParams)

      expect(rGroup.clone(fidMap)).toStrictEqual(cloneRGroup)
    })
  })
})
