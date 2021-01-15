import { StandaloneStructService } from './struct'
import { StructService } from './struct/structService.types'

// @ts-ignore
function initStructService(baseUrl: string, options: any): StructService {
  ;(global as any).ketcher.standalone = true
  return new StandaloneStructService(options)
}
export default initStructService
