import {
  moleculeToStruct,
  atomToStruct,
  rglabelToStruct,
  atomListToStruct,
  bondToStruct
} from '../../../../../src/script/format/chemGraph/fromGraph/moleculeToStruct'
import testGraph from '../../data/testGraph.json'
import testRglabel from '../../data/testRglabel.json'
import testAtomList from '../../data/testAtomList.json'
import { Atom, Bond } from 'ketcher-core'

const struct = moleculeToStruct(testGraph.mol0)

describe('Content of the molecule', () => {
  it('should contain atoms in struct', () => {
    expect(struct.atoms.get(0)).toBeDefined()
  })
  it('should contain bonds in struct', () => {
    expect(struct.bonds.get(0)).toBeDefined()
  })
})

describe('Check instances of elements', () => {
  it('atom`s instance', () => {
    struct.atoms.forEach(atom => {
      expect(atom).toBeInstanceOf(Atom)
    })
  })
  it('bond`s instances', () => {
    struct.bonds.forEach(bond => {
      expect(bond).toBeInstanceOf(Bond)
    })
  })
})

describe('Atom should contain', () => {
  const atomStruct = atomToStruct(testGraph.mol0.atoms[0])
  const atomStruct1 = atomToStruct(testGraph.mol0.atoms[1])
  const atomStruct2 = atomToStruct(testGraph.mol0.atoms[2])
  it('alias', () => {
    expect(atomStruct.alias).toBe(testGraph.mol0.atoms[0].alias)
  })
  it('location', () => {
    expect(Object.values(atomStruct.pp)).toEqual(
      testGraph.mol0.atoms[0].location
    )
  })
  it('isotope', () => {
    expect(atomStruct.isotope).toBe(testGraph.mol0.atoms[0].isotope)
  })
  it('charge', () => {
    expect(atomStruct1.charge).toBe(testGraph.mol0.atoms[1].charge)
  })
  it('explicitValence', () => {
    expect(atomStruct1.explicitValence).toBe(
      testGraph.mol0.atoms[1].explicitValence
    )
  })
  it('attachmentPoints', () => {
    expect(atomStruct1.attpnt).toBe(testGraph.mol0.atoms[1].attachmentPoints)
  })
  it('radical', () => {
    expect(atomStruct1.radical).toBe(testGraph.mol0.atoms[1].radical)
  })
  it('stereoParity', () => {
    expect(atomStruct2.stereoParity).toBe(testGraph.mol0.atoms[2].stereoParity)
  })
  it('substitutionCount', () => {
    expect(atomStruct2.substitutionCount).toBe(
      testGraph.mol0.atoms[2].substitutionCount
    )
  })
  it('unsaturatedAtom', () => {
    expect(atomStruct2.unsaturatedAtom).toBe(
      testGraph.mol0.atoms[2].unsaturatedAtom
    )
  })
  it('hCount', () => {
    expect(atomStruct2.hCount).toBe(testGraph.mol0.atoms[2].hCount)
  })
  it('mapping', () => {
    expect(atomStruct2.aam).toBe(testGraph.mol0.atoms[2].mapping)
  })
  it('invRet', () => {
    expect(atomStruct2.invRet).toBe(testGraph.mol0.atoms[2].invRet)
  })
  it('exactChangeFlag', () => {
    expect(atomStruct2.exactChangeFlag).toBe(
      testGraph.mol0.atoms[2].exactChangeFlag
    )
  })
})

describe('rglabel should contain', () => {
  const rglabelStruct = rglabelToStruct(testRglabel.mol0.atoms[0])
  it('location', () => {
    expect(Object.values(rglabelStruct.pp)).toEqual(
      testRglabel.mol0.atoms[0].location
    )
  })
  it('attachmentPoints', () => {
    expect(rglabelStruct.attpnt).toBe(
      testRglabel.mol0.atoms[0].attachmentPoints
    )
  })
})

describe('atomList should contain', () => {
  const atomList = atomListToStruct(testAtomList.mol0.atoms[5])
  it('location', () => {
    expect(Object.values(atomList.pp)).toEqual(
      testAtomList.mol0.atoms[5].location
    )
  })
})

describe('bond should contain', () => {
  const bondStruct = bondToStruct(testGraph.mol0.bonds[0])
  it('type', () => {
    expect(bondStruct.type).toBe(testGraph.mol0.bonds[0].type)
  })
  it('begin atom', () => {
    expect(bondStruct.begin).toBe(testGraph.mol0.bonds[0].atoms[0])
  })
  it('end atom', () => {
    expect(bondStruct.end).toBe(testGraph.mol0.bonds[0].atoms[1])
  })
})
