import { KetSerializer } from '../KetSerializer'
import { Struct } from '../../../entities'
import * as validate from '../validate'
import * as headerToGraph from '../toGraph/headerToGraph'
import * as rgroupToGraph from '../toGraph/rgroupToGraph'
import {
  baseContent,
  baseStruct,
  contentWithoutHeader,
  rgroupStruct
} from './fixtures/data'

const ket = new KetSerializer()

describe('deserialize', () => {
  it('function should return struct instance', () => {
    const ket = new KetSerializer()
    const res = ket.deserialize(baseContent)
    expect(res instanceof Struct).toBeTruthy()
  })
  it('validation function should be called always', () => {
    const spy = jest.spyOn(validate, 'validate')
    ket.deserialize(baseContent)
    expect(spy).toBeCalled()
  })
  it('struct should not have name attr', () => {
    expect(ket.deserialize(contentWithoutHeader).name).toBeNull()
  })
})
describe('serialize', () => {
  it('check result function', () => {
    const res = ket.serialize(baseStruct)
    expect(res).toEqual(baseContent)
  })
  it('function headerToGraph should be called if struct has name', () => {
    const spy = jest.spyOn(headerToGraph, 'headerToGraph')
    baseStruct.name = 'Name for base struct'
    ket.serialize(baseStruct)
    expect(spy).toBeCalled()
  })
  it('function headerToGraph should set up struct.name to header', () => {
    const expectedHeader = {
      moleculeName: 'Name for base struct'
    }
    baseStruct.name = expectedHeader.moleculeName
    const result = ket.serialize(baseStruct)
    expect(JSON.parse(result).header).toEqual(expectedHeader)
  })
  it('function rgroupToGraph should set up struct.name', () => {
    const spy = jest.spyOn(rgroupToGraph, 'rgroupToGraph')
    ket.serialize(rgroupStruct)
    expect(spy).toBeCalled()
  })
  it('function rgroupToGraph should set up rgroup struct', () => {
    const result = JSON.parse(ket.serialize(rgroupStruct)).rg14
    expect(result).toBeTruthy()
    expect(result.atoms.length).toEqual(4)
    expect(result.bonds.length).toEqual(3)
    expect(result.rlogic.number).toEqual(14)
  })
})
