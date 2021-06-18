import { arrowToGraph, plusToGraph } from './toGraph/rxnToGraph'

import { Serializer } from './../serializers.types'
import { Struct } from 'chemistry/entities'
import { Vec2 } from 'utils'
import { headerToGraph } from './toGraph/headerToGraph'
import { moleculeToGraph } from './toGraph/moleculeToGraph'
import { moleculeToStruct } from './fromGraph/moleculeToStruct'
import { prepareStructForGraph } from './toGraph/prepare'
import { rgroupToGraph } from './toGraph/rgroupToGraph'
import { rgroupToStruct } from './fromGraph/rgroupToStruct'
import { rxnToStruct } from './fromGraph/rxnToStruct'
import { simpleObjectToGraph } from './toGraph/simpleObjectToGraph'
import { simpleObjectToStruct } from './fromGraph/simpleObjectToStruct'
import { textToGraph } from './toGraph/textToGraph'
import { textToStruct } from './fromGraph/textToStruct'
import { validate } from './validate'

function parseNode(node: any, struct: any) {
  const type = node.type
  switch (type) {
    case 'arrow':
      rxnToStruct(node, struct)
      break
    case 'plus':
      rxnToStruct(node, struct)
      break
    case 'simpleObject':
      simpleObjectToStruct(node, struct)
      break
    case 'molecule':
      const currentStruct = moleculeToStruct(node)
      if (node.stereoFlagPosition) {
        const fragment = currentStruct.frags.get(0)!
        fragment.stereoFlagPosition = new Vec2(node.stereoFlagPosition)
      }

      currentStruct.mergeInto(struct)
      break
    case 'rgroup':
      rgroupToStruct(node).mergeInto(struct)
      break
    case 'text':
      textToStruct(node, struct)
      break
    default:
      break
  }
}
export class KetSerializer implements Serializer<Struct> {
  deserialize(content: string): Struct {
    const resultingStruct = new Struct()
    const graph = JSON.parse(content)
    if (!validate(graph)) {
      throw new Error('Cannot deserialize input JSON.')
    }
    resultingStruct.name = graph.header ? graph.header.moleculeName : null

    const nodes = graph.root.nodes
    Object.keys(nodes).forEach(i => {
      if (nodes[i].type) parseNode(nodes[i], resultingStruct)
      else if (nodes[i].$ref) parseNode(graph[nodes[i].$ref], resultingStruct)
    })

    return resultingStruct
  }

  serialize(struct: Struct): string {
    const result: any = {
      root: {
        nodes: []
      }
    }

    const header = headerToGraph(struct)
    if (header) result.header = header

    const graphNodes = prepareStructForGraph(struct)

    let moleculeId = 0
    graphNodes.forEach(item => {
      switch (item.type) {
        case 'molecule': {
          result.root.nodes.push({ $ref: `mol${moleculeId}` })
          result[`mol${moleculeId++}`] = moleculeToGraph(item.fragment)
          break
        }
        case 'rgroup': {
          result.root.nodes.push({ $ref: `rg${item.data!.rgnumber}` })
          result[`rg${item.data!.rgnumber}`] = rgroupToGraph(
            item.fragment,
            item.data
          )
          break
        }
        case 'plus': {
          result.root.nodes.push(plusToGraph(item))
          break
        }
        case 'arrow': {
          result.root.nodes.push(arrowToGraph(item))
          break
        }
        case 'simpleObject': {
          result.root.nodes.push(simpleObjectToGraph(item))
          break
        }
        case 'text': {
          result.root.nodes.push(textToGraph(item))
          break
        }
        default:
          break
      }
    })

    return JSON.stringify(result, null, 4)
  }
}
