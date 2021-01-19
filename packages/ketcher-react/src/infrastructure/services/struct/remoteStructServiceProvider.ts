import { StructService, StructServiceProvider } from './structService.types'
import IndigoService from './remoteStructService'

class RemoteStructServiceProvider implements StructServiceProvider {
  createStructService(baseUrl: string, options: any): StructService {
    return new IndigoService(baseUrl, options)
  }
}
export default RemoteStructServiceProvider
