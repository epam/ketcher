import { Graph } from '../../../format/chemGraph/Graph'
import { SupportedFormat } from '../../../ui/data/convert/struct.types'
import { StructureService } from '../StructureService'
import { BaseServiceStrategy } from './BaseServiceStrategy'

export class GraphServiceStrategy
  extends BaseServiceStrategy
  implements StructureService {
  async getStructureAsync(): Promise<Graph> {
    const stringifiedGraph = await this.getStructureByFormatAsync(
      SupportedFormat.Graph
    )
    return JSON.parse(stringifiedGraph)
  }
}
