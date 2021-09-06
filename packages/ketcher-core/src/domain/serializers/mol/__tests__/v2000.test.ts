import {
  applyAtomProp,
  parseAtomLine,
  parseAtomListLine,
  parseBondLine,
  parsePropertyLines
} from '../v2000'
import { Vec2, Bond, Atom, AtomParams } from '../../../entities'
import { basic } from './fixtures/basic'
import molParsers from '../v2000'

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

  describe('parsePropertyLines', () => {
    it('should parse atom alias', () => {
      const atomAliasLine = 'A   58\nACH'
      const ctabLines = atomAliasLine.split('\n')
      const shift = 0
      const end = 2
      const sGroups = {}
      const rLogic = {}
      const props = parsePropertyLines(
        {},
        ctabLines,
        shift,
        end,
        sGroups,
        rLogic
      )
      expect(props.get('alias' as any).get(57)).toBe('ACH')
    })

    it('should parse pseudo', () => {
      const atomAliasLine = "A   58\n'pseudoText'"
      const ctabLines = atomAliasLine.split('\n')
      const shift = 0
      const end = 2
      const sGroups = {}
      const rLogic = {}
      const props = parsePropertyLines(
        {},
        ctabLines,
        shift,
        end,
        sGroups,
        rLogic
      )
      expect(props.get('pseudo' as any).get(57)).toBe('pseudoText')
    })

    it('should parse charge', () => {
      const chargePropLine = ['M  CHG  2   7  -3  25   2']
      const shift = 0
      const end = 1
      const sGroups = {}
      const rLogic = {}
      const props = parsePropertyLines(
        {},
        chargePropLine,
        shift,
        end,
        sGroups,
        rLogic
      )
      expect(props.get('charge' as any).get(6)).toBe(-3)
      expect(props.get('charge' as any).get(24)).toBe(2)
    })

    it('should parse radical', () => {
      const radPropLine = ['M  RAD  2  22   3  23   1']
      const shift = 0
      const end = 1
      const sGroups = {}
      const rLogic = {}
      const props = parsePropertyLines(
        {},
        radPropLine,
        shift,
        end,
        sGroups,
        rLogic
      )
      expect(props.get('radical' as any).get(21)).toBe(3)
      expect(props.get('radical' as any).get(22)).toBe(1)
    })

    it('should parse isotope', () => {
      const isotopePropLine = ['M  ISO  2  19  13  15  11']
      const shift = 0
      const end = 1
      const sGroups = {}
      const rLogic = {}
      const props = parsePropertyLines(
        {},
        isotopePropLine,
        shift,
        end,
        sGroups,
        rLogic
      )
      expect(props.get('isotope' as any).get(18)).toBe(13)
      expect(props.get('isotope' as any).get(14)).toBe(11)
    })

    it('should parse ringBondCount', () => {
      const rbcPropLine = ['M  RBC  2  31  -2  13   4']
      const shift = 0
      const end = 1
      const sGroups = {}
      const rLogic = {}
      const props = parsePropertyLines(
        {},
        rbcPropLine,
        shift,
        end,
        sGroups,
        rLogic
      )
      expect(props.get('ringBondCount' as any).get(30)).toBe(-2)
      expect(props.get('ringBondCount' as any).get(12)).toBe(4)
    })

    it('should parse substitutionCount', () => {
      const subPropLine = ['M  SUB  2  17  -2  11   6']
      const shift = 0
      const end = 1
      const sGroups = {}
      const rLogic = {}
      const props = parsePropertyLines(
        {},
        subPropLine,
        shift,
        end,
        sGroups,
        rLogic
      )
      expect(props.get('substitutionCount' as any).get(16)).toBe(-2)
      expect(props.get('substitutionCount' as any).get(10)).toBe(6)
    })

    it('should parse unsaturatedAtom', () => {
      const subPropLine = ['M  UNS  2   4   1  12   0']
      const shift = 0
      const end = 1
      const sGroups = {}
      const rLogic = {}
      const props = parsePropertyLines(
        {},
        subPropLine,
        shift,
        end,
        sGroups,
        rLogic
      )
      expect(props.get('unsaturatedAtom' as any).get(3)).toBe(1)
      expect(props.get('unsaturatedAtom' as any).get(11)).toBe(0)
    })

    it('should parse rgroup props', () => {
      const rgpPropLine = [
        'M  RGP  4   1   2   8   1  11   3  14   1',
        'M  LOG  1   1   0   0   1',
        'M  LOG  1   2   3   0   >0',
        'M  LOG  1   3   0   1   >0'
      ]

      const firstLogic = { resth: false, range: '1' }
      const secondLogic = { resth: false, range: '>0', ifthen: 3 }
      const thirdLogic = { resth: true, range: '>0' }
      const shift = 0
      const end = 4
      const sGroups = {}
      const rLogic = {}
      const props = parsePropertyLines(
        {},
        rgpPropLine,
        shift,
        end,
        sGroups,
        rLogic
      )

      expect(props.get('rglabel' as any).get(0)).toBe(2)
      expect(props.get('rglabel' as any).get(7)).toBe(1)
      expect(props.get('rglabel' as any).get(10)).toBe(4)
      expect(props.get('rglabel' as any).get(13)).toBe(1)

      expect(rLogic[1]).toStrictEqual(firstLogic)
      expect(rLogic[2]).toStrictEqual(secondLogic)
      expect(rLogic[3]).toStrictEqual(thirdLogic)
    })

    it('should parse attachment point', () => {
      const line = ['M  APO  2   1   1   4   2']
      const shift = 0
      const end = 1
      const sGroups = {}
      const rLogic = {}
      const props = parsePropertyLines({}, line, shift, end, sGroups, rLogic)
      expect(props.get('attpnt' as any).get(0)).toBe(1)
      expect(props.get('attpnt' as any).get(3)).toBe(2)
    })

    it('should parse atom list', () => {
      const listLine = ['M  ALS  28  3 F Sg  Bh  Pr ']
      const notListLine = ['M  ALS  28  3 T Sg  Bh  Pr ']
      const shift = 0
      const end = 1
      const sGroups = {}
      const rLogic = {}
      const listLineProps = parsePropertyLines(
        {},
        listLine,
        shift,
        end,
        sGroups,
        rLogic
      )
      const notListLineProps = parsePropertyLines(
        {},
        notListLine,
        shift,
        end,
        sGroups,
        rLogic
      )
      expect(listLineProps.get('label' as any).get(27)).toBe('L#')
      expect(listLineProps.get('atomList' as any).get(27).notList).toBe(false)
      expect(listLineProps.get('atomList' as any).get(27).ids).toStrictEqual([
        106,
        107,
        59
      ])
      expect(notListLineProps.get('atomList' as any).get(27).notList).toBe(true)
    })

    describe('SGroups', () => {
      const sGroups = {}
      it('should init sGroup', () => {
        const sgroupInitLine = ['M  STY  2   1 MUL   2 SRU']
        const shift = 0
        const end = 1
        const rLogic = {}
        parsePropertyLines({}, sgroupInitLine, shift, end, sGroups, rLogic)
        expect(sGroups[0].type).toBe('MUL')
        expect(sGroups[1].type).toBe('SRU')
      })

      it('should parse sgroup props', () => {
        const sgroupInitLine = [
          'M  SST  2   1 ALT   2 RAN',
          'M  SLB  2   1   1   2   2',
          'M  SPL  1   1   2',
          'M  SCN  2   1  EU   2  HT',
          'M  SMT   1  3'
        ]
        const shift = 0
        const end = 5
        const rLogic = {}
        parsePropertyLines({}, sgroupInitLine, shift, end, sGroups, rLogic)
        expect(sGroups[0].data.subtype).toBe('ALT')
        expect(sGroups[1].data.subtype).toBe('RAN')
        expect(sGroups[0].data.label).toBe(1)
        expect(sGroups[1].data.label).toBe(2)
        expect(sGroups[0].parent).toBe(2)
        expect(sGroups[0].data.connectivity).toBe('EU')
        expect(sGroups[1].data.connectivity).toBe('HT')
        expect(sGroups[0].data.subscript).toBe('3')
      })

      it('should parse sgroup array props', () => {
        const lines = [
          'M  SAL   2  3  11  12  10',
          'M  SBL   1  2   4  30',
          'M  SPA   1  3   3   4   5'
        ]
        const shift = 0
        const end = 3
        const rLogic = {}
        parsePropertyLines({}, lines, shift, end, sGroups, rLogic)
        expect(sGroups[1].atoms).toStrictEqual([10, 11, 9])
        expect(sGroups[0].bonds).toStrictEqual([3, 29])
        expect(sGroups[0].patoms).toStrictEqual([2, 3, 4])
      })

      it('should parse sgroup data props', () => {
        const lines = [
          'M  SDT   1 test30characterdescaaaaaaaaaaa F',
          'M  SDD   2     1.0000    5.0000    AAU',
          'M  SCD   1 testData',
          'M  SED   2 absolute'
        ]
        const shift = 0
        const end = 4
        const rLogic = {}
        parsePropertyLines({}, lines, shift, end, sGroups, rLogic)
        expect(sGroups[0].data.fieldName).toBe('test30characterdescaaaaaaaaaaa')
        expect(sGroups[0].data.fieldType).toBe('F')
        expect(sGroups[1].pp).toEqual({ x: 1, y: -5, z: 0 })
        expect(sGroups[1].data.attached).toBe(true)
        expect(sGroups[1].data.absolute).toBe(true)
        expect(sGroups[1].data.showUnits).toBe(true)
        expect(sGroups[0].data.fieldValue).toBe('testData')
        expect(sGroups[1].data.fieldValue).toBe('absolute')
      })
    })
  })

  describe('applyAtomProp', () => {
    it('should add property to atom', () => {
      const atom = new Atom({} as AtomParams)
      const atoms = new Map()
      atoms.set(0, atom)
      const propId = 'charge'
      const values = new Map()
      values.set(0, 2)
      applyAtomProp(atoms as any, values as any, propId)
      expect(atoms.get(0).charge).toBe(2)
    })
  })

  describe('parseCTabV2000', () => {
    const basicCtabLines = basic.split('\n').slice(3)
    const basicCountsSplit = [
      ' 76',
      ' 71',
      '  0',
      '   ',
      '  1',
      '  0',
      '   ',
      '   ',
      '   ',
      '   ',
      '999',
      ' V2000'
    ]

    it('should add exact number of elements to Struct', () => {
      const struct = molParsers.parseCTabV2000(basicCtabLines, basicCountsSplit)
      expect(struct.atoms.size).toBe(76)
      expect(struct.bonds.size).toBe(71)
    })

    it('should apply props to atoms and bonds', () => {
      const struct = molParsers.parseCTabV2000(basicCtabLines, basicCountsSplit)
      expect(struct.bonds.get(4)!.stereo).toBe(4)
      expect(struct.atoms.get(5)!.exactChangeFlag).toBe(true)
      expect(struct.atoms.get(6)!.charge).toBe(-3)
    })

    it('should add stereoLabel to atom', () => {
      const struct = molParsers.parseCTabV2000(basicCtabLines, basicCountsSplit)
      expect(struct.atoms.get(3)!.stereoLabel).toBe('abs')
    })
  })
})
