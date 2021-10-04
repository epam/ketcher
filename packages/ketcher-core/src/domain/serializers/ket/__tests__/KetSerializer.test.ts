import * as headerToGraph from '../toGraph/headerToGraph'
import * as moleculeToGraph from '../toGraph/moleculeToGraph'
import * as moleculeToStruct from '../fromGraph/moleculeToStruct'
import * as prepareStructForGraph from '../toGraph/prepare'
import * as rgroupToGraph from '../toGraph/rgroupToGraph'
import * as rgroupToStruct from '../fromGraph/rgroupToStruct'
import * as rxnToGraph from '../toGraph/rxnToGraph'
import * as rxnToStruct from '../fromGraph/rxnToStruct'
import * as simpleObjectToGraph from '../toGraph/simpleObjectToGraph'
import * as simpleObjectToStruct from '../fromGraph/simpleObjectToStruct'
import * as textToGraph from '../toGraph/textToGraph'
import * as textToStruct from '../fromGraph/textToStruct'
import * as validate from '../validate'

import {
  AtomList,
  RGroup,
  RxnArrow,
  RxnPlus,
  SimpleObject,
  Struct,
  Text
} from 'domain/entities'
import {
  baseContent,
  baseStruct,
  contentRgroup,
  contentWithoutHeader,
  errorContent,
  moleculeContent,
  moleculeSgroup,
  moleculeSgroupStruct,
  moleculeStruct,
  prepareStruct,
  rgroupStruct,
  rxnContent,
  rxnStruct,
  simpleObjectContent,
  simpleObjectStruct,
  textContent,
  textStruct
} from './fixtures/data'

import { KetSerializer } from '../ketSerializer'

const ket = new KetSerializer()

describe('deserialize (ToStruct)', () => {
  it('function should return struct instance', () => {
    const res = ket.deserialize(baseContent)
    expect(res instanceof Struct).toBeTruthy()
    expect(res).toEqual(baseStruct)
  })
  it('validation function', () => {
    const spy = jest.spyOn(validate, 'validate')
    ket.deserialize(baseContent)
    expect(spy).toBeCalled()
    expect(spy.mock.results[0].value).toBeTruthy()
    expect(() => ket.deserialize(errorContent)).toThrow(
      'Cannot deserialize input JSON.'
    )
    expect(spy.mock.results[1].value).toBeFalsy()
  })
  it('struct should not have name attr', () => {
    expect(ket.deserialize(contentWithoutHeader).name).toBeNull()
  })
  it('rxnToStruct', () => {
    const spy = jest.spyOn(rxnToStruct, 'rxnToStruct')
    ket.deserialize(rxnContent)
    expect(spy).toBeCalled()
    expect(spy.mock.results[0].value.rxnArrows).toBeDefined()
    expect(
      spy.mock.results[0].value.rxnArrows.get(0) instanceof RxnArrow
    ).toBeTruthy()
    expect(spy.mock.results[0].value.rxnArrows.size).toEqual(1)
    expect(spy.mock.results[0].value.rxnArrows.get(0).mode).toEqual(
      'open-angle'
    )
    expect(spy.mock.results[1].value.rxnPluses).toBeDefined()
    expect(
      spy.mock.results[0].value.rxnPluses.get(0) instanceof RxnPlus
    ).toBeTruthy()
    expect(spy.mock.results[1].value.rxnPluses.size).toEqual(2)
  })
  it('simpleObjectToStruct', () => {
    const spy = jest.spyOn(simpleObjectToStruct, 'simpleObjectToStruct')
    ket.deserialize(simpleObjectContent)
    expect(spy).toBeCalled()
    expect(spy.mock.results[0].value.simpleObjects).toBeDefined()
    expect(spy.mock.results[0].value.simpleObjects.size).toEqual(1)
    expect(spy.mock.results[0].value.simpleObjects.get(0).mode).toEqual(
      'ellipse'
    )
    expect(
      spy.mock.results[0].value.simpleObjects.get(0) instanceof SimpleObject
    ).toBeTruthy()
  })
  it('textToStruct', () => {
    const spy = jest.spyOn(textToStruct, 'textToStruct')
    ket.deserialize(textContent)
    expect(spy).toBeCalled()
    expect(spy.mock.results[0].value.texts).toBeDefined()
    expect(spy.mock.results[0].value.texts.get(0) instanceof Text).toBeTruthy()
  })
  it('moleculeToStruct', () => {
    const spy = jest.spyOn(moleculeToStruct, 'moleculeToStruct')
    ket.deserialize(moleculeContent)
    expect(spy).toBeCalled()
    //atoms
    expect(spy.mock.results[0].value.atoms.get(0).label).toEqual('R#')
    expect(spy.mock.results[1].value.atoms.get(2).charge).toEqual(5)
    expect(spy.mock.results[1].value.atoms.get(4).label).toEqual('L#')
    expect(
      spy.mock.results[1].value.atoms.get(4).atomList instanceof AtomList
    ).toBeTruthy()
    expect(spy.mock.results[1].value.atoms.get(4).atomList.ids).toEqual([4, 3])
    expect(spy.mock.results[1].value.atoms.size).toEqual(7)
    //bonds
    expect(spy.mock.results[1].value.bonds.size).toEqual(7)
    expect(spy.mock.results[1].value.bonds.get(6).stereo).toBeTruthy()
    expect(spy.mock.results[1].value.bonds.get(0).type).toEqual(1)
    expect(spy.mock.results[1].value.bonds.get(1).type).toEqual(2)
    //sgroups
    ket.deserialize(moleculeSgroup)
    expect(spy.mock.results[2].value.sgroups.get(0).type).toEqual('GEN')
    expect(spy.mock.results[3].value.sgroups.get(0).type).toEqual('MUL')
    expect(spy.mock.results[3].value.sgroups.get(0).data.mul).toEqual(1)
    expect(spy.mock.results[4].value.sgroups.get(0).type).toEqual('SRU')
    expect(spy.mock.results[4].value.sgroups.get(0).data.subscript).toEqual('n')
    expect(spy.mock.results[4].value.sgroups.get(0).data.connectivity).toEqual(
      'ht'
    )
    expect(spy.mock.results[5].value.sgroups.get(0).type).toEqual('MUL')
    expect(spy.mock.results[5].value.sgroups.get(0).data.mul).toEqual(3)
    expect(spy.mock.results[6].value.sgroups.get(0).type).toEqual('SUP')
    expect(spy.mock.results[6].value.sgroups.get(0).data.name).toEqual('B')
    expect(spy.mock.results[7].value.sgroups.get(0).type).toEqual('SRU')
    expect(spy.mock.results[7].value.sgroups.get(0).data.subscript).toEqual('n')
    expect(spy.mock.results[7].value.sgroups.get(0).data.connectivity).toEqual(
      'hh'
    )
  })
  it('rgroupToStruct', () => {
    const spy = jest.spyOn(rgroupToStruct, 'rgroupToStruct')
    ket.deserialize(contentRgroup)
    expect(spy).toBeCalled()
    expect(spy.mock.results[0].value).toBeTruthy()
    expect(spy.mock.results[0].value.atoms.size).toEqual(4)
    expect(spy.mock.results[0].value.bonds.size).toEqual(3)
    expect(spy.mock.results[0].value.rgroups.get(14)).toBeTruthy()
    expect(
      spy.mock.results[0].value.rgroups.get(14) instanceof RGroup
    ).toBeTruthy()
  })
})
describe('serialize (ToGraph)', () => {
  it('check result serialize function', () => {
    const res = ket.serialize(baseStruct)
    expect(res).toEqual(baseContent)
  })
  it('headerToGraph', () => {
    const spy = jest.spyOn(headerToGraph, 'headerToGraph')
    const expectedHeader = {
      moleculeName: 'Name for base struct'
    }
    baseStruct.name = expectedHeader.moleculeName
    const result = ket.serialize(baseStruct)
    expect(spy).toBeCalled()
    expect(spy.mock.results[0].value).toEqual(expectedHeader)
    expect(JSON.parse(result).header).toEqual(expectedHeader)
  })
  it('moleculeToGraph', () => {
    const spy = jest.spyOn(moleculeToGraph, 'moleculeToGraph')
    ket.serialize(moleculeStruct)
    //atoms
    expect(spy).toBeCalled()
    expect(spy.mock.results[0].value.atoms[0].type).toEqual('rg-label')
    expect(spy.mock.results[1].value.atoms[2].charge).toEqual(5)
    expect(
      spy.mock.results[1].value.atoms.filter(item => item.type === 'atom-list')
    ).toBeTruthy()
    expect(spy.mock.results[1].value.atoms[4].elements).toEqual(['Be', 'Li'])
    expect(spy.mock.results[1].value.atoms.length).toEqual(7)
    //bonds
    expect(spy.mock.results[1].value.bonds.length).toEqual(7)
    expect(
      spy.mock.results[1].value.bonds.filter(bond => bond.stereo).length
    ).toEqual(1)
    expect(
      spy.mock.results[1].value.bonds.filter(bond => bond.type === 1).length
    ).toEqual(4)
    expect(
      spy.mock.results[1].value.bonds.filter(bond => bond.type === 2).length
    ).toEqual(3)
    //sgroups
    ket.serialize(moleculeSgroupStruct)
    expect(spy.mock.results[2].value.sgroups[0].type).toEqual('GEN')
    expect(spy.mock.results[3].value.sgroups[0].type).toEqual('MUL')
    expect(spy.mock.results[3].value.sgroups[0].mul).toEqual(1)
    expect(spy.mock.results[4].value.sgroups[0].type).toEqual('SRU')
    expect(spy.mock.results[4].value.sgroups[0].subscript).toEqual('n')
    expect(spy.mock.results[4].value.sgroups[0].connectivity).toEqual('HT')
    expect(spy.mock.results[5].value.sgroups[0].type).toEqual('MUL')
    expect(spy.mock.results[5].value.sgroups[0].mul).toEqual(3)
    expect(spy.mock.results[6].value.sgroups[0].type).toEqual('SUP')
    expect(spy.mock.results[6].value.sgroups[0].name).toEqual('B')
    expect(spy.mock.results[7].value.sgroups[0].type).toEqual('SRU')
    expect(spy.mock.results[7].value.sgroups[0].subscript).toEqual('n')
    expect(spy.mock.results[7].value.sgroups[0].connectivity).toEqual('HH')
  })
  it('rgroupToGraph', () => {
    const spy = jest.spyOn(rgroupToGraph, 'rgroupToGraph')
    const result = JSON.parse(ket.serialize(rgroupStruct)).rg14
    expect(spy).toBeCalled()
    expect(result).toBeTruthy()
    expect(result.atoms.length).toEqual(4)
    expect(result.bonds.length).toEqual(3)
    expect(result.rlogic.number).toEqual(14)
  })
  it('rnxToGraph', () => {
    const spyArrow = jest.spyOn(rxnToGraph, 'arrowToGraph')
    const spyPlus = jest.spyOn(rxnToGraph, 'plusToGraph')
    const result = JSON.parse(ket.serialize(rxnStruct))
    const plus = result.root.nodes.filter(item => item.type === 'plus')
    const arrow = result.root.nodes.filter(item => item.type === 'arrow')
    expect(spyArrow).toBeCalled()
    expect(spyPlus).toBeCalled()
    expect(plus.length).toEqual(2)
    expect(arrow.length).toEqual(1)
    expect(arrow[0].data.mode).toEqual('open-angle')
  })
  it('simpleObjectToGraph', () => {
    const spy = jest.spyOn(simpleObjectToGraph, 'simpleObjectToGraph')
    ket.serialize(simpleObjectStruct)
    expect(spy).toBeCalled()
    expect(spy.mock.results[0].value.data.mode).toEqual('ellipse')
  })
  it('textToGraph', () => {
    const spy = jest.spyOn(textToGraph, 'textToGraph')
    ket.serialize(textStruct)
    expect(spy).toBeCalled()
    expect(spy.mock.results[0].value.type).toEqual('text')
  })
  it('prepareStructForGraph', () => {
    const spy = jest.spyOn(prepareStructForGraph, 'prepareStructForGraph')
    ket.serialize(prepareStruct)
    expect(spy).toBeCalled()
    expect(
      spy.mock.results[0].value.filter(item => item.type === 'molecule').length
    ).toEqual(1)
    expect(
      spy.mock.results[0].value.filter(item => item.type === 'molecule')[0]
        .fragment.atoms.size
    ).toEqual(6)
    expect(
      spy.mock.results[0].value.filter(item => item.type === 'molecule')[0]
        .fragment.bonds.size
    ).toEqual(6)
    expect(
      spy.mock.results[0].value.filter(item => item.type === 'arrow').length
    ).toBeTruthy()
    expect(
      spy.mock.results[0].value.filter(item => item.type === 'arrow')[0].data
        .mode
    ).toEqual('open-angle')
    expect(
      spy.mock.results[0].value.filter(item => item.type === 'plus').length
    ).toBeTruthy()
    expect(
      spy.mock.results[0].value.filter(item => item.type === 'simpleObject')
        .length
    ).toBeTruthy()
    expect(
      spy.mock.results[0].value.filter(item => item.type === 'simpleObject')[0]
        .data.mode
    ).toEqual('rectangle')
    expect(
      spy.mock.results[0].value.filter(item => item.type === 'text').length
    ).toBeTruthy()
  })
})
