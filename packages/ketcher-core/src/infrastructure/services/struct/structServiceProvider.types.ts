import { StructService, StructServiceOptions } from './structService.types'

export type ServiceMode = 'standalone' | 'remote'

export interface StructServiceProvider {
  mode: ServiceMode
  createStructService: (options: StructServiceOptions) => StructService
}
