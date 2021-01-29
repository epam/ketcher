import { GraphManager, Struct } from '../chem'
import { StructFormatter, StructProvider } from './structFormatter.types'

export class GraphFormatter implements StructFormatter<string> {
  constructor(
    private readonly structProvider: StructProvider,
    private readonly graphManager: GraphManager
  ) {}

  async getStructureAsync(): Promise<string> {
    const struct = this.structProvider.struct()
    return this.getStructureFromStructAsync(struct)
  }

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
