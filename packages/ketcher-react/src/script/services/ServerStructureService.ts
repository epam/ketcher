import { Api } from '../api'
import { MolfileFormat } from '../chem/molfile'
import Editor from '../editor'
import { Graph } from '../format/chemGraph/Graph'
import { SupportedFormat } from '../ui/data/convert/struct.types'
import * as structConverter from '../ui/data/convert/structConverter'
import { StructureService } from './StructureService'

export class ServerStructureService implements StructureService {
  constructor(private readonly editor: Editor, private readonly api: Api) {}

  getStructureAsync(
    structureFormat: SupportedFormat = SupportedFormat.Rxn
  ): Promise<string> {
    const { editor } = this

    return this.api.then(server => {
      if (!server.isAvailable) {
        throw new Error('server is not available')
      }

      const struct = editor.struct()
      return structConverter.toString(struct, structureFormat, this.api)
    })
  }

  getSmilesAsync(isExtended: boolean = false): Promise<string> {
    const format = isExtended
      ? SupportedFormat.SmilesExt
      : SupportedFormat.Smiles
    return this.getStructureAsync(format)
  }

  getMolfileAsync(molfileFormat: MolfileFormat = 'v2000'): Promise<string> {
    const format =
      molfileFormat === 'v3000' ? SupportedFormat.MolV3000 : SupportedFormat.Mol
    return this.getStructureAsync(format)
  }

  async getGraphAsync(): Promise<Graph> {
    const stringifiedGraph = await this.getStructureAsync(SupportedFormat.Graph)
    return JSON.parse(stringifiedGraph)
  }
}
