import { ChemicalMimeType } from 'infrastructure'

export class SupportedFormatProperties {
  name: string
  mime: ChemicalMimeType
  extensions: string[]
  supportsCoords?: boolean
  options?: any

  constructor(
    name: string,
    mime: ChemicalMimeType,
    extensions: string[],
    supportsCoords?: boolean,
    options?: any
  ) {
    this.name = name
    this.mime = mime
    this.extensions = extensions
    this.supportsCoords = supportsCoords || false
    this.options = options || {}
  }
}
