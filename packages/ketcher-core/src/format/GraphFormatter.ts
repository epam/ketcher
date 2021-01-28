import { Graph, GraphManager, Struct } from '../chem'
import { StructFormatter, StructProvider } from './structFormatter.types'

export class GraphFormatter implements StructFormatter<Graph> {
  constructor(
    private readonly structProvider: StructProvider,
    private readonly graphManager: GraphManager
  ) {}

  async getStructureAsync(): Promise<Graph> {
    const struct = this.structProvider.struct()
    return this.getStructureFromStructAsync(struct)
  }

  getStructureFromStructAsync(struct: Struct): Promise<Graph> {
    const graph = this.graphManager.toGraph(struct)
    return Promise.resolve(graph)
  }

  getStructureFromStringAsync(stringifiedStruct: string): Promise<Struct> {
    const parsedStruct = JSON.parse(stringifiedStruct)
    const graph = this.graphManager.fromGraph(parsedStruct)
    return Promise.resolve(graph)
  }
}
