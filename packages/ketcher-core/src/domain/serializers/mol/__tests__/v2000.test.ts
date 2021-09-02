import { parseAtomLine, parseAtomListLine, parseBondLine } from '../v2000'
import { Vec2, Bond } from '../../../entities'

describe('v2000 serializer', () => {
  describe('parseAtomLine', () => {
    it('should parse xyz params', () => {
      const atomLine =
        '   14.0000   -3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0'
      const secondAtomLine =
        '   14.0000   3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0'
      const atom = parseAtomLine(atomLine)
      const secondAtom = parseAtomLine(secondAtomLine)
      expect(atom.pp instanceof Vec2).toBe(true)
      expect(atom.pp).toStrictEqual(new Vec2({ x: 14, y: 3, z: 0 }))
      expect(secondAtom.pp).toStrictEqual(new Vec2({ x: 14, y: -3, z: 0 }))
    })

    it('should not parse incorrect xyz atom line', () => {
      // correct pattern is xxxxx.xxxxyyyyy.yyyyzzzzz.zzzz
      const incorrectAtomLine =
        '  14.0000 -3.35000 0.123456 S   0  0  0  0  0  0  0  0  0  0  0  0'
      const atom = parseAtomLine(incorrectAtomLine)
      expect(atom.pp).not.toStrictEqual({ x: 14, y: 3, z: 0 })
    })

    it('should parse correctly two-digit integers', () => {
      const atomLine =
        '   14.1234  -23.5678   10.9876 S   0  0  0  0  0  0  0  0  0  0  0  0'
      const atom = parseAtomLine(atomLine)
      expect(atom.pp).toStrictEqual(
        new Vec2({ x: 14.1234, y: 23.5678, z: 10.9876 })
      )
    })

    it('should parse correctly label', () => {
      const atomLine =
        '   14.1234  -23.5678   10.9876 S   0  0  0  0  0  0  0  0  0  0  0  0'
      const twoDigitLabel =
        '   14.1234  -23.5678   10.9876 Cl  0  0  0  0  0  0  0  0  0  0  0  0'
      const threeDigitLabel =
        '   14.1234  -23.5678   10.9876 Gen  0  0  0  0  0  0  0  0  0  0  0  0'
      const atom = parseAtomLine(atomLine)
      const atomWithTwoDigitLabel = parseAtomLine(twoDigitLabel)
      const atomWithThreeDigitLabel = parseAtomLine(threeDigitLabel)
      expect(atom.label).toBe('S')
      expect(atomWithTwoDigitLabel.label).toBe('Cl')
      expect(atomWithThreeDigitLabel.label).toBe('Gen')
    })

    it('should not parse label that is not match pattern', () => {
      const incorrectAtomLine =
        '   14.1234  -23.5678   10.9876Cl    0  0  0  0  0  0  0  0  0  0  0  0'
      const incorrectAtomLine2 =
        '   14.1234  -23.5678   10.9876   Na  0  0  0  0  0  0  0  0  0  0  0  0'
      const atom = parseAtomLine(incorrectAtomLine)
      const atom2 = parseAtomLine(incorrectAtomLine2)
      expect(atom.label).not.toBe('Cl')
      expect(atom2).not.toBe('Na')
    })

    it('should trim label', () => {
      const atomLine =
        '   14.1234  -23.5678   10.9876 S   0  0  0  0  0  0  0  0  0  0  0  0'
      const atom = parseAtomLine(atomLine)
      expect(atom.label).not.toBe('S  ')
      expect(atom.label).toBe('S')
    })

    it('should parse charge correctly', () => {
      const zeroCharge =
        '   14.1234  -23.5678   10.9876 S   0  0  0  0  0  0  0  0  0  0  0  0'
      const oneCharge =
        '   14.1234  -23.5678   10.9876 S   0  1  0  0  0  0  0  0  0  0  0  0'
      const twoCharge =
        '   14.1234  -23.5678   10.9876 S   0  2  0  0  0  0  0  0  0  0  0  0'
      const threeCharge =
        '   14.1234  -23.5678   10.9876 S   0  3  0  0  0  0  0  0  0  0  0  0'
      const fourCharge =
        '   14.1234  -23.5678   10.9876 S   0  4  0  0  0  0  0  0  0  0  0  0'
      const fiveCharge =
        '   14.1234  -23.5678   10.9876 S   0  5  0  0  0  0  0  0  0  0  0  0'
      const sixCharge =
        '   14.1234  -23.5678   10.9876 S   0  6  0  0  0  0  0  0  0  0  0  0'
      const sevenCharge =
        '   14.1234  -23.5678   10.9876 S   0  7  0  0  0  0  0  0  0  0  0  0'

      const atomWithZeroCharge = parseAtomLine(zeroCharge)
      const atomWithOneCharge = parseAtomLine(oneCharge)
      const atomWithTwoCharge = parseAtomLine(twoCharge)
      const atomWithThreeCharge = parseAtomLine(threeCharge)
      const atomWithFourCharge = parseAtomLine(fourCharge)
      const atomWithFiveCharge = parseAtomLine(fiveCharge)
      const atomWithSixCharge = parseAtomLine(sixCharge)
      const atomWithSevenCharge = parseAtomLine(sevenCharge)

      expect(atomWithZeroCharge.charge).toBe(0)
      expect(atomWithOneCharge.charge).toBe(+3)
      expect(atomWithTwoCharge.charge).toBe(+2)
      expect(atomWithThreeCharge.charge).toBe(+1)
      expect(atomWithFourCharge.charge).toBe(0)
      expect(atomWithFiveCharge.charge).toBe(-1)
      expect(atomWithSixCharge.charge).toBe(-2)
      expect(atomWithSevenCharge.charge).toBe(-3)
    })

    it('should parse hCount correctly', () => {
      const atomLine =
        '   14.1234  -23.5678   10.9876 S   0  0  0  1  0  0  0  0  0  0  0  0'
      const atom = parseAtomLine(atomLine)
      expect(atom.hCount).toBe(1)
    })

    it('should parse explicitValence', () => {
      const atomLine =
        '   14.1234  -23.5678   10.9876 S   0  0  0  0  0  0  0  0  0  0  0  0'
      const atomLine2 =
        '   14.1234  -23.5678   10.9876 S   0  0  0  0  0  7  0  0  0  0  0  0'
      const atomLine3 =
        '   14.1234  -23.5678   10.9876 S   0  0  0  0  0 15  0  0  0  0  0  0'
      const atom = parseAtomLine(atomLine)
      const atom2 = parseAtomLine(atomLine2)
      const atom3 = parseAtomLine(atomLine3)
      expect(atom.explicitValence).toBe(-1)
      expect(atom2.explicitValence).toBe(7)
      expect(atom3.explicitValence).toBe(0)
    })

    it('should not parse correctly explicitValence that not match pattern', () => {
      const atomLine =
        '   14.1234  -23.5678   10.9876 S   0  0  0  0  0  15  0  0  0  0  0  0'
      const atom = parseAtomLine(atomLine)
      expect(atom.explicitValence).not.toBe(0)
    })

    it('should parse correctly aam', () => {
      const atomLine =
        '   14.1234  -23.5678   10.9876 S   0  0  0  0  0  0  0  0  0  1  0  0'
      const atom = parseAtomLine(atomLine)
      expect(atom.aam).toBe(1)
    })

    it('should parse correctly invRet', () => {
      const atomLine =
        '   14.1234  -23.5678   10.9876 S   0  0  0  0  0  0  0  0  0  0  1  0'
      const atom = parseAtomLine(atomLine)
      expect(atom.invRet).toBe(1)
    })

    it('should parse correctly exactChangeFlag', () => {
      const atomLine =
        '   14.1234  -23.5678   10.9876 S   0  0  0  0  0  0  0  0  0  0  0  1'
      const atom = parseAtomLine(atomLine)
      expect(atom.exactChangeFlag).toBe(true)
    })
  })

  describe('parseBondLine', () => {
    it('should parse atom numbers correctly', () => {
      const bondLine = '1  2  2  0     0  0'
      const bondLine2 = '3339992  0     0  0'
      const bondLine3 = '22 44 0     0  0'
      const bond = parseBondLine(bondLine)
      const bond2 = parseBondLine(bondLine2)
      const bond3 = parseBondLine(bondLine3)
      expect(bond.begin).toBe(0)
      expect(bond.end).toBe(1)
      expect(bond2.begin).toBe(332)
      expect(bond2.end).toBe(998)
      expect(bond3.begin).toBe(21)
      expect(bond3.end).toBe(43)
    })

    it('should not parse correctly atom numbers that do not match pattern', () => {
      // pattern is 111222tttsssxxxrrrccc
      // where 111 - first atom
      // 222 - second atom
      const bondLine = '123  21  2  0     0  0'
      const bond = parseBondLine(bondLine)
      expect(bond.end).not.toBe(20)
    })

    it('should parse correctly bond type', () => {
      const single = '1  2  1  0     0  0'
      const double = '1  2  2  0     0  0'
      const triple = '1  2  3  0     0  0'
      const aroma = '1  2  4  0     0  0'
      const singleOrDouble = '1  2  5  0     0  0'
      const singleOrAroma = '1  2  6  0     0  0'
      const doubleOrAroma = '1  2  7  0     0  0'
      const any = '1  2  8  0     0  0'
      const dative = '1  2  9  0     0  0'
      const hydrogen = '1  2  10  0     0  0'

      const singleBond = parseBondLine(single)
      const doubleBond = parseBondLine(double)
      const tripleBond = parseBondLine(triple)
      const aromaBond = parseBondLine(aroma)
      const singleOrDoubleBond = parseBondLine(singleOrDouble)
      const singleOrAromaBond = parseBondLine(singleOrAroma)
      const doubleOrAromaBond = parseBondLine(doubleOrAroma)
      const anyBond = parseBondLine(any)
      const dativeBond = parseBondLine(dative)
      const hydrogenBond = parseBondLine(hydrogen)

      expect(singleBond.type).toBe(Bond.PATTERN.TYPE.SINGLE)
      expect(doubleBond.type).toBe(Bond.PATTERN.TYPE.DOUBLE)
      expect(tripleBond.type).toBe(Bond.PATTERN.TYPE.TRIPLE)
      expect(aromaBond.type).toBe(Bond.PATTERN.TYPE.AROMATIC)
      expect(singleOrDoubleBond.type).toBe(Bond.PATTERN.TYPE.SINGLE_OR_DOUBLE)
      expect(singleOrAromaBond.type).toBe(Bond.PATTERN.TYPE.SINGLE_OR_AROMATIC)
      expect(doubleOrAromaBond.type).toBe(Bond.PATTERN.TYPE.DOUBLE_OR_AROMATIC)
      expect(anyBond.type).toBe(Bond.PATTERN.TYPE.ANY)
      expect(dativeBond.type).toBe(Bond.PATTERN.TYPE.DATIVE)
      expect(hydrogenBond.type).toBe(Bond.PATTERN.TYPE.HYDROGEN)
    })

    it('should parse correctly stereo', () => {
      const noneStereo = '1  2  1  0     0  0'
      const upStereo = '1  2  1  1     0  0'
      const eitherStereo = '1  2  1  4     0  0'
      const downStereo = '1  2  1  6     0  0'
      const cisTransStereo = '1  2  1  3     0  0'

      const noneBond = parseBondLine(noneStereo)
      const upBond = parseBondLine(upStereo)
      const eitherBond = parseBondLine(eitherStereo)
      const downBond = parseBondLine(downStereo)
      const cisTransBond = parseBondLine(cisTransStereo)

      expect(noneBond.stereo).toBe(Bond.PATTERN.STEREO.NONE)
      expect(upBond.stereo).toBe(Bond.PATTERN.STEREO.UP)
      expect(eitherBond.stereo).toBe(Bond.PATTERN.STEREO.EITHER)
      expect(downBond.stereo).toBe(Bond.PATTERN.STEREO.DOWN)
      expect(cisTransBond.stereo).toBe(Bond.PATTERN.STEREO.CIS_TRANS)
    })

    it('should parse xxx', () => {
      const bondLine = '1  2  1  0     0  0'
      const bond = parseBondLine(bondLine)
      expect(bond.xxx).toBe('   ')
    })

    it('should parse topology correctly', () => {
      const eitherTopology = '1  2  1  0     0  0'
      const ringTopology = '1  2  1  0     1  0'
      const chainTopology = '1  2  1  0     2  0'

      const bondWithEitherTplg = parseBondLine(eitherTopology)
      const bondWithRingTplg = parseBondLine(ringTopology)
      const bondWithChainTplg = parseBondLine(chainTopology)

      expect(bondWithEitherTplg.topology).toBe(Bond.PATTERN.TOPOLOGY.EITHER)
      expect(bondWithRingTplg.topology).toBe(Bond.PATTERN.TOPOLOGY.RING)
      expect(bondWithChainTplg.topology).toBe(Bond.PATTERN.TOPOLOGY.CHAIN)
    })

    it('should parse reactingCenterStatus correctly', () => {
      const bondLine = '1  2  1  0     0  1'
      const bond = parseBondLine(bondLine)
      expect(bond.reactingCenterStatus).toBe(1)
    })
  })

  describe('parseAtomListLine', () => {
    it('should parse atom number correctly', () => {
      // pattern: aaa kSSSSn 111 222 333 444 555
      const atomListLine = '1   T    5 111 222 333 444 555'
      const atomListLine2 = '3   T    5 111 222 333 444 555'
      const atomList = parseAtomListLine(atomListLine)
      const atomList2 = parseAtomListLine(atomListLine2)

      expect(atomList.aid).toBe(0)
      expect(atomList2.aid).toBe(2)
    })

    it('should not parse atom number that does not match pattern', () => {
      const atomListLine = '   5   T    5 111 222 333 444 555'
      const atomList = parseAtomListLine(atomListLine)
      expect(atomList.aid).not.toBe(4)
    })

    it('should parse list type correctly', () => {
      const atomListLine = '1   T    5 111 222 333 444 555'
      const atomListLine2 = '1   F    5 111 222 333 444 555'

      const atomList = parseAtomListLine(atomListLine)
      const atomList2 = parseAtomListLine(atomListLine2)

      expect(atomList.atomList.notList).toBe(true)
      expect(atomList2.atomList.notList).toBe(false)
    })

    it('should parse list count and atomic numbers correctly', () => {
      const ids1 = '111 222 333 444'
      const ids2 = '111 222'

      const atomListLine = `1   T    4 ${ids1}`
      const atomListLine2 = `1   F    2 ${ids2}`

      const atomList = parseAtomListLine(atomListLine)
      const atomList2 = parseAtomListLine(atomListLine2)

      expect(atomList.atomList.ids).toHaveLength(4)
      expect(atomList.atomList.ids.join(' ')).toBe(ids1)
      expect(atomList2.atomList.ids).toHaveLength(2)
      expect(atomList2.atomList.ids.join(' ')).toBe(ids2)
    })
  })

  describe.skip('parsePropertyLines', () => {
    it('', () => {})
  })
})
