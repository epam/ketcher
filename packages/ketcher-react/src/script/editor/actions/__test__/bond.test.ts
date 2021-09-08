import { fromBondAddition } from '../bond'
import { FragmentStereoFlag, restruct, singleBond } from './data'
import { AtomAdd, AtomAttr } from '../../operations/atom'
import { BondAdd } from '../../operations/bond'
import { CalcImplicitH } from '../../operations'

const [action, begin, end] = fromBondAddition(
  restruct as any,
  singleBond as any,
  5,
  undefined
)

describe('Bond Addition', () => {
  it('should contain operation BondAdd and CalcImplicitH', () => {
    expect(action).toEqual(
      expect.arrayContaining([BondAdd, CalcImplicitH] as any)
    )
  })
  it('bond begin should be defined', () => {
    expect(begin).toBeDefined()
  })
  it('bond end should be defined', () => {
    expect(end).toBeDefined()
  })
  it('should contain operation FragmentStereoFlag if extra single bond add', () => {
    expect(action).toEqual(expect.arrayContaining(FragmentStereoFlag as any))
  })
  it('should contain operation AtomAdd if begin or end is undefined', () => {
    expect(action).toEqual(expect.arrayContaining(AtomAdd as any))
  })
  it('should contain operation AtomAttr if begin or end isDefined', () => {
    expect(action).toEqual(expect.arrayContaining(AtomAttr as any))
  })
})
