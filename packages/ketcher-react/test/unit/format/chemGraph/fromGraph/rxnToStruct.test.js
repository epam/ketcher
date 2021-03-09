import { rxnToStruct } from '../../../../../src/script/format/chemGraph/fromGraph/rxnToStruct'
import { Struct } from 'ketcher-core'
import testGraph from '../../data/testGraph.json'

test('rxn to struct test if-path', () => {
  expect(rxnToStruct(testGraph.root.nodes[0], new Struct())).toBeTruthy()
})

test('rxn to struct test else-path', () => {
  expect(rxnToStruct(testGraph.mol0.atoms[0], new Struct())).toBeTruthy()
})
