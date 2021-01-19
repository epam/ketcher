import { StructService, StructServiceProvider } from './structService.types'
import IndigoService from './remoteStructService'

class RemoteStructServiceProvider implements StructServiceProvider {
  private baseUrl!: string

  constructor(baseUrl: string) {
    this.baseUrl = !baseUrl || /\/$/.test(baseUrl) ? baseUrl : baseUrl + '/';
  }

  initStructService(options: any): StructService {

    ;(global as any).ketcher.apiPath = this.baseUrl
    return new IndigoService(this.baseUrl, options)
  }
}
export default RemoteStructServiceProvider
