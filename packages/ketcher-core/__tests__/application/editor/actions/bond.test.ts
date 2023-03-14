import * as utils from 'application/editor/actions/utils'

import { restruct, singleBond } from './data'

import { fromBondAddition } from 'application/editor/actions'

const [action, begin, end] = fromBondAddition(
  restruct as any,
  singleBond as any,
  1,
  { label: 'C' }
)

describe('Bond Addition', () => {
  it('function atomForNewBond was called when end undefined', () => {
    const spy = jest.spyOn(utils, 'atomForNewBond')
    fromBondAddition(restruct as any, singleBond as any, 3, { label: 'C' })
    expect(spy).toHaveBeenCalled()
  })
  it('function atomGetAttr was called', () => {
    const spy = jest.spyOn(utils, 'atomGetAttr')
    fromBondAddition(restruct as any, singleBond as any, 5, 1)
    expect(spy).toHaveBeenCalled()
  })
  it('should contain operation CalcImplicitH', () => {
    const CalcImplicitH = action.operations.find(
      (operation) => operation.type === 'Calculate implicit hydrogen'
    )
    expect(CalcImplicitH).toBeDefined()
  })
  it('should contain operation Add fragment stereo flag', () => {
    const addFragment = action.operations.find(
      (operation) => operation.type === 'Add fragment stereo flag'
    )
    expect(addFragment).toBeDefined()
  })
  it('bond begin should be defined', () => {
    expect(begin).toBeDefined()
  })
  it('bond end should be defined', () => {
    expect(end).toBeDefined()
  })
})
