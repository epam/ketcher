import { ChemicalMimeType } from '../infrastructure/services'

export class SupportedFormatProperties {
  name: string
  mime: ChemicalMimeType
  ext: Array<string>
  supportsCoords?: boolean
  options?: any

  constructor(
    name: string,
    mime: ChemicalMimeType,
    ext: Array<string>,
    supportsCoords?: boolean,
    options?: any
  ) {
    this.name = name
    this.mime = mime
    this.ext = ext
    this.supportsCoords = supportsCoords || false
    this.options = options || {}
  }
}
