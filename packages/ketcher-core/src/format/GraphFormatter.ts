import { GraphManager, Struct } from 'chemistry'
import { StructFormatter } from './structFormatter.types'

export class GraphFormatter implements StructFormatter {
  constructor(private readonly graphManager: GraphManager) {}

  getStructureFromStructAsync(struct: Struct): Promise<string> {
    const graph = this.graphManager.toGraph(struct)
    const stringifiedGraph = JSON.stringify(graph, null, 4)
    return Promise.resolve(stringifiedGraph)
  }

  getStructureFromStringAsync(stringifiedStruct: string): Promise<Struct> {
    const parsedStruct = JSON.parse(stringifiedStruct)
    const graph = this.graphManager.fromGraph(parsedStruct)
    return Promise.resolve(graph)
  }
}
