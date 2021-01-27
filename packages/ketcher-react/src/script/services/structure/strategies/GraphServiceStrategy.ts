import { StructProvider } from '../../../editor'
import graph, { Graph } from '../../../format/chemGraph'
import { StructureService } from '../StructureService'

export class GraphServiceStrategy implements StructureService {
  constructor(protected readonly structProvider: StructProvider) {}

  async getStructureAsync(): Promise<Graph> {
    const struct = this.structProvider.struct()
    const _graph = graph.toGraph(struct)
    // const stringifiedGraph = JSON.stringify(_graph, null, 4)
    // return Promise.resolve(_graph.toString())
    return Promise.resolve(_graph)
  }
}
