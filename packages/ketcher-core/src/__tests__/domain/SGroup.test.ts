import {
  Bond,
  Box2Abs,
  Pile,
  Pool,
  SGroup,
  Struct,
  Vec2
} from 'domain/entities'

describe('SGroup', () => {
  describe('getAttr', () => {
    it('should return value of attribute', () => {
      const sGroup = new SGroup(SGroup.TYPES.SUP)
      const attr = 'connectivity'
      const attrValue = sGroup.data.connectivity

      expect(sGroup.getAttr(attr)).toBe(attrValue)
    })
  })

  describe('getAttrs', () => {
    it('should return all attributes', () => {
      const sGroup = new SGroup(SGroup.TYPES.SUP)
      const allAttributes = sGroup.data

      expect(sGroup.getAttrs()).toStrictEqual(allAttributes)
    })
  })

  describe('setAttr', () => {
    it('should update attribute value', () => {
      const sGroup = new SGroup(SGroup.TYPES.SUP)
      const attr = 'connectivity'
      const newValue = 'hh'

      sGroup.setAttr(attr, newValue)

      expect(sGroup.getAttr(attr)).toBe(newValue)
    })
  })

  describe('checkAttr', () => {
    it('should return true if values are match', () => {
      const sGroup = new SGroup(SGroup.TYPES.SUP)
      const attr = 'connectivity'
      const value = 'ht'

      expect(sGroup.checkAttr(attr, value)).toBe(true)
    })

    it('should return false if values are not match', () => {
      const sGroup = new SGroup(SGroup.TYPES.SUP)
      const attr = 'connectivity'
      const value = 'hh'

      expect(sGroup.checkAttr(attr, value)).toBe(false)
    })
  })

  describe('updateOffset', () => {
    it('should update SGroup pp value by offset', () => {
      const sGroup = new SGroup(SGroup.TYPES.SUP)
      const offset = new Vec2(2, 2, 2)
      const newValue = new Vec2(2, 2, 2)

      sGroup.bracketBox = new Box2Abs(new Vec2(0, 0, 0), new Vec2(0, 0, 0))
      sGroup.updateOffset(offset)
      expect(sGroup.pp).toStrictEqual(newValue)
    })
  })

  describe('calculatePP', () => {
    it('should update SGroup pp value by struct', () => {
      const sGroup = new SGroup(SGroup.TYPES.SUP)
      const struct = new Struct()

      const groups = new Pool()
      groups.add(1)
      groups.add(1)
      struct.sgroups = groups

      sGroup.bracketBox = new Box2Abs(new Vec2(0, 0, 0), new Vec2(0, 0, 0))
      const newValue = new Vec2(0.5, 0.5, 0)

      sGroup.calculatePP(struct)
      expect(sGroup.pp).toStrictEqual(newValue)
    })

    it('should update SGroup pp value by first and only atom of sGroupif fieldName is INDIGO_CIP_DESC', () => {
      const sGroup = new SGroup(SGroup.TYPES.SUP)
      const struct = new Struct()

      sGroup.data.fieldName = 'INDIGO_CIP_DESC'

      sGroup.bracketBox = new Box2Abs(new Vec2(0, 0, 0), new Vec2(0, 0, 0))
      const newValue = new Vec2(0.5, 0.5, 0)

      sGroup.atoms[0] = 0

      const atoms = new Pool()
      atoms.add({ pp: new Vec2(0.5, 0.5, 0) })
      struct.atoms = atoms

      sGroup.calculatePP(struct)
      expect(sGroup.pp).toStrictEqual(newValue)
    })
  })

  describe('getOffset static function', () => {
    it('should return null if SGroup do not has pp', () => {
      const sGroup = new SGroup(SGroup.TYPES.SUP)

      expect(SGroup.getOffset(sGroup)).toBe(null)
    })

    it('should return offset if SGroup has pp and bracketBox', () => {
      const sGroup = new SGroup(SGroup.TYPES.SUP)
      sGroup.pp = new Vec2(4, 4, 4)
      sGroup.bracketBox = { p1: new Vec2(3, 3, 3) }
      const offset = new Vec2(1, 1, 1)

      expect(SGroup.getOffset(sGroup)).toStrictEqual(offset)
    })
  })

  describe('filterAtoms static function', () => {
    it('should return filtered atoms', () => {
      const atoms = [0, 1, 3]
      const map = ['h', 4, 'br', -7]
      const filteredAtoms = [0, 4, -1]

      expect(SGroup.filterAtoms(atoms, map)).toStrictEqual(filteredAtoms)
    })
  })

  describe('removeNegative static function', () => {
    it('should return only natural number of atoms', () => {
      const atoms = [0, -1, 3]
      const filteredAtoms = [0, 3]

      expect(SGroup.removeNegative(atoms)).toStrictEqual(filteredAtoms)
    })
  })

  describe('filter static function', () => {
    it('should filter SGroup atoms', () => {
      const sGroup = new SGroup(SGroup.TYPES.SUP)
      sGroup.atoms = [0, 1, -2, 3]
      const atomMap = ['h', 4, 'br', -7]
      const mol = ''
      const filteredAtoms = [0, 4]
      SGroup.filter(mol, sGroup, atomMap)

      expect(sGroup.atoms).toStrictEqual(filteredAtoms)
    })
  })

  describe('clone static function', () => {
    it('should return clone SGroup with new atoms values by aidMap', () => {
      const sGroup = new SGroup(SGroup.TYPES.SUP)
      sGroup.atoms = [1, 2]
      const aidMap = new Map()
      aidMap.set(1, 3)
      aidMap.set(2, 10)

      const newSGroup = new SGroup(SGroup.TYPES.SUP)
      newSGroup.atoms = [3, 10]
      newSGroup.bonds = null
      newSGroup.patoms = null

      expect(SGroup.clone(sGroup, aidMap)).toStrictEqual(newSGroup)
    })
  })

  describe('addAtom static function', () => {
    it('should add new atom to SGroup', () => {
      const sGroup = new SGroup(SGroup.TYPES.SUP)
      const newAtom = 3
      const newAtoms = [...sGroup.atoms, newAtom]

      SGroup.addAtom(sGroup, newAtom)

      expect(sGroup.atoms).toStrictEqual(newAtoms)
    })
  })

  describe('removeAtom static function', () => {
    it('should remove atom from SGroup', () => {
      const sGroup = new SGroup(SGroup.TYPES.SUP)
      sGroup.atoms = [1, 3, 6, 4]
      const removedAtom = 3
      const newAtoms = [1, 6, 4]

      SGroup.removeAtom(sGroup, removedAtom)

      expect(sGroup.atoms).toStrictEqual(newAtoms)
    })
  })

  describe('getCrossBonds static function', () => {
    it('should return indexes of bond end and begin if they are in parentAtomSet', () => {
      const mol = {
        bonds: [
          { begin: 1, end: 2 },
          { begin: 2, end: 3 }
        ]
      }
      const parentAtomSet = new Pile()
      const parentAtom = 2
      parentAtomSet.add(parentAtom)
      const crossBonds = { [parentAtom]: [0, 1] }

      expect(SGroup.getCrossBonds(mol, parentAtomSet)).toStrictEqual(crossBonds)
    })
  })

  describe('bracketPos static function', () => {
    it('should set braketBox in SGroup', () => {
      const sGroup = new SGroup(SGroup.TYPES.SUP)
      sGroup.atoms = [0, 1]

      const molAtoms = new Map()
      molAtoms.set(0, { pp: new Vec2(1, 2, 3) })
      molAtoms.set(1, { pp: new Vec2(2, 4, 9) })

      const mol = {
        atoms: molAtoms,
        bonds: [
          { begin: 1, end: 2 },
          { begin: 2, end: 3 }
        ]
      }
      const bondParams = {
        begin: 1,
        end: 2,
        type: 1,
        stereo: 0,
        topology: 1
      }
      const crossBondsPerAtom = { 0: [new Bond(bondParams)] }
      const braketBox = new Box2Abs(
        new Vec2(0.6499999999999999, 1.4500000000000002, 0),
        new Vec2(2.35, 4.550000000000001, 0)
      )

      SGroup.bracketPos(sGroup, mol, crossBondsPerAtom)
      expect(sGroup.bracketBox).toStrictEqual(braketBox)
    })
  })

  describe('getBracketParameters static function', () => {
    it('should return brackets', () => {
      const mol = []
      const bondParams = {
        begin: 1,
        end: 2,
        type: 1,
        stereo: 0,
        topology: 1
      }
      const crossBondsPerAtom = { 0: [new Bond(bondParams)] }
      const atomSet = new Pile()
      const bb = new Box2Abs(1, 1, 1, 1)
      const d = 0
      const n = 0

      const brackets = [
        {
          c: new Vec2(1, 1, 0),
          d: new Vec2(-1, 0, 0),
          h: 0,
          n: new Vec2(0, -1, 0),
          w: 0
        },
        {
          c: new Vec2(1, 1, 0),
          d: new Vec2(1, 0, 0),
          h: 0,
          n: new Vec2(0, 1, 0),
          w: 0
        }
      ]

      expect(
        SGroup.getBracketParameters(mol, crossBondsPerAtom, atomSet, bb, d, n)
      ).toEqual(brackets)
    })
  })

  describe('getObjBBox static function', () => {
    it('should return BBox', () => {
      const atoms = [0, 1]
      const molAtoms = new Map()
      molAtoms.set(0, { pp: new Vec2(1, 2, 3) })
      molAtoms.set(1, { pp: new Vec2(2, 4, 9) })
      const mol = { atoms: molAtoms }

      const bb = { p0: new Vec2(1, 2, 3), p1: new Vec2(2, 4, 9) }

      expect(SGroup.getObjBBox(atoms, mol)).toEqual(bb)
    })
  })

  describe('getAtoms static function', () => {
    it('should return atoms if SGroup do not has allAtoms', () => {
      const sGroup = new SGroup(SGroup.TYPES.SUP)
      sGroup.atoms = [1]
      const atoms = [1]
      const mol = []

      expect(SGroup.getAtoms(mol, sGroup)).toStrictEqual(atoms)
    })

    it('should return atoms indexes from mol', () => {
      const sGroup = new SGroup(SGroup.TYPES.SUP)
      sGroup.allAtoms = [1]
      sGroup.atoms = [1]
      const atoms = [0, 1, 2]
      const mol = { atoms: [3, 4, 6] }

      expect(SGroup.getAtoms(mol, sGroup)).toStrictEqual(atoms)
    })
  })

  describe('getBonds static function', () => {
    it('should return bond indexes from mol', () => {
      const sGroup = new SGroup(SGroup.TYPES.SUP)
      sGroup.allAtoms = [1]
      sGroup.atoms = [1, 2, 3, 4]
      const bonds = [0, 1]
      const mol = {
        atoms: [3, 4, 6, 2, 7],
        bonds: [
          { begin: 1, end: 2 },
          { begin: 2, end: 3 }
        ]
      }

      expect(SGroup.getBonds(mol, sGroup)).toStrictEqual(bonds)
    })
  })

  describe('prepareMulForSaving static function', () => {
    it('should throw Error if cross-bonds number not equal 2', () => {
      const sGroup = new SGroup(SGroup.TYPES.SUP)
      sGroup.atoms = [1, 2, 3, 4]
      const mol = {
        bonds: [{ begin: 2, end: 7 }]
      }

      expect(() => SGroup.prepareMulForSaving(sGroup, mol)).toThrow(
        'Unsupported cross-bonds number'
      )
    })

    it('should update bonds of sGroup', () => {
      const sGroup = new SGroup(SGroup.TYPES.SUP)
      sGroup.atoms = [1, 2, 3, 4]
      const bond_1 = new Bond({ type: 1, begin: 1, end: 7 })
      const bond_2 = new Bond({ type: 1, begin: 3, end: 7 })
      const bonds = new Map()
      bonds.set(0, bond_1)
      bonds.set(1, bond_2)
      const mol = { bonds }

      SGroup.prepareMulForSaving(sGroup, mol)
      expect(sGroup.bonds).toStrictEqual([0, 1])
    })
  })

  describe('getMassCentre static function', () => {
    it('should return mass center of structure', () => {
      const atoms = [0, 1]
      const molAtoms = new Map()
      molAtoms.set(0, { pp: new Vec2(1, 2, 3) })
      molAtoms.set(1, { pp: new Vec2(2, 4, 9) })
      const mol = { atoms: molAtoms }
      const massCenter = new Vec2(1.5, 3, 6)

      expect(SGroup.getMassCentre(mol, atoms)).toStrictEqual(massCenter)
    })
  })
})
