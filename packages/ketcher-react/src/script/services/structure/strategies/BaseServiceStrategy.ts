import { Api } from '../../../api'
import Editor from '../../../editor'
import { SupportedFormat } from '../../../ui/data/convert/struct.types'
import * as structConverter from '../../../ui/data/convert/structConverter'

export class BaseServiceStrategy {
  constructor(private readonly editor: Editor, private readonly api: Api) {}

  protected getStructureByFormatAsync(format: SupportedFormat): Promise<any> {
    const { editor } = this

    return this.api.then(server => {
      if (!server.isAvailable) {
        throw new Error('server is not available')
      }

      const struct = editor.struct()
      return structConverter.toString(struct, format, this.api)
    })
  }
}
