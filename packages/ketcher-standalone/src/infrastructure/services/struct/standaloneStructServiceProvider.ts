import { StructService, StructServiceProvider } from './structService.types'
import StandaloneStructService from './standaloneStructService'

class StandaloneStructServiceProvider implements StructServiceProvider {

  constructor() {
    ;(global as any).ketcher.standalone = true
  }

  // @ts-ignore
  createStructService(baseUrl: string, options: any): StructService {
    return new StandaloneStructService(options)
  }
}
export default StandaloneStructServiceProvider
