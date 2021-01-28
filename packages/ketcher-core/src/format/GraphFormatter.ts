import { StructFormatter, StructProvider } from './structFormatter.types'
import { Graph, GraphManager } from '../chem/graph'

export class GraphFormatter implements StructFormatter {
  constructor(
    private readonly structProvider: StructProvider,
    private readonly graphManager: GraphManager
  ) {}

  async getStructureAsync(): Promise<Graph> {
    const struct = this.structProvider.struct()
    const graph = this.graphManager.toGraph(struct)
    return Promise.resolve(graph)
  }
}
