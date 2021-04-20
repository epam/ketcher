import { GraphManager, Struct } from 'chemistry'
import { StructFormatter } from './structFormatter.types'

export class GraphFormatter implements StructFormatter {
  constructor(private readonly graphManager: GraphManager) {}

  async getStructureFromStructAsync(struct: Struct): Promise<string> {
    const graph = this.graphManager.toGraph(struct)
    const stringifiedGraph = JSON.stringify(graph, null, 4)
    return stringifiedGraph
  }

  async getStructureFromStringAsync(
    stringifiedStruct: string
  ): Promise<Struct> {
    const parsedStruct = JSON.parse(stringifiedStruct)
    return this.graphManager.fromGraph(parsedStruct)
  }
}
