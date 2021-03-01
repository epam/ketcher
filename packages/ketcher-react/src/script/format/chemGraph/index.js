/****************************************************************************
 * Copyright 2020 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/
import { Struct } from 'ketcher-core'
import { headerToGraph } from './toGraph/headerToGraph'
import { moleculeToGraph } from './toGraph/moleculeToGraph'
import { rgroupToGraph } from './toGraph/rgroupToGraph'
import { arrowToGraph, plusToGraph } from './toGraph/rxnToGraph'
import { simpleObjectToGraph } from './toGraph/simpleObjectToGraph'
import { moleculeToStruct } from './fromGraph/moleculeToStruct'
import { rgroupToStruct } from './fromGraph/rgroupToStruct'
import { rxnToStruct } from './fromGraph/rxnToStruct'
import { simpleObjectToStruct } from './fromGraph/simpleObjectToStruct'

import { prepareStructForGraph } from './toGraph/prepare'

/**
 * @param {import('ketcher-core').Struct} struct
 * @returns {import('ketcher-core').Graph} */
function toGraph(struct) {
  const result = {
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
        result.root.nodes.push({ $ref: `rg${item.data.rgnumber}` })
        result[`rg${item.data.rgnumber}`] = rgroupToGraph(
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
      default:
        break
    }
  })

  return result
}

/**
 * @param {import('ketcher-core').Graph} graph
 * @returns {import('ketcher-core').Struct} */
function fromGraph(graph) {
  const resultingStruct = new Struct()
  resultingStruct.name = graph.header ? graph.header.moleculeName : null

  const nodes = graph.root.nodes
  Object.keys(nodes).forEach(i => {
    if (nodes[i].type) parseNode(nodes[i], resultingStruct)
    else if (nodes[i].$ref) parseNode(graph[nodes[i].$ref], resultingStruct)
  })

  return resultingStruct
}

function parseNode(node, struct) {
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
      moleculeToStruct(node).mergeInto(struct)
      break
    case 'rgroup':
      rgroupToStruct(node).mergeInto(struct)
      break
    default:
      break
  }
}

export default {
  toGraph,
  fromGraph
}
