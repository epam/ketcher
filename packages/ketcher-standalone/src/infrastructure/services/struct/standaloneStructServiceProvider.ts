import { StructService, StructServiceProvider } from './structService.types'
import StandaloneStructService from './standaloneStructService'

class StandaloneStructServiceProvider implements StructServiceProvider {
  // @ts-ignore
  initStructService(baseUrl: string, options: any): StructService {
    ;(global as any).ketcher.standalone = true
    return new StandaloneStructService(options)
  }
}
export default StandaloneStructServiceProvider
