/****************************************************************************
 * Copyright 2020 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/
import indigoModuleFn from './../../../generated/libindigo'
import { StructService } from './structService.types'

function setOptions(indigoOptions: any, options: any) {
  for (let [key, value] of Object.entries(options)) {
    indigoOptions.set(key, (value as any).toString())
  }
}

enum ChemicalMimeType {
  Mol = 'chemical/x-mdl-molfile',
  Rxn = 'chemical/x-mdl-rxnfile',
  DaylightSmiles = 'chemical/x-daylight-smiles',
  ExtendedSmiles = 'chemical/x-chemaxon-cxsmiles',
  DaylightSmarts = 'chemical/x-daylight-smarts',
  InchI = 'chemical/x-inchi',
  InChIAuxInfo = 'chemical/x-inchi-aux',
  CML = 'chemical/x-cml'
}

enum SupportedFormat {
  Rxn = 'rxnfile',
  Mol = 'molfile',
  Smiles = 'smiles',
  Smarts = 'smarts',
  CML = 'cml',
  InchI = 'inchi',
  InChIAuxInfo = 'inchi-aux'
}

function convertMimeTypeToOutputFormat(
  mimeType: ChemicalMimeType
): SupportedFormat | undefined {
  let format: SupportedFormat | undefined
  switch (mimeType) {
    case ChemicalMimeType.Mol: {
      format = SupportedFormat.Mol
      break
    }
    case ChemicalMimeType.Rxn: {
      format = SupportedFormat.Rxn
      break
    }
    case ChemicalMimeType.DaylightSmiles:
    case ChemicalMimeType.ExtendedSmiles: {
      format = SupportedFormat.Smiles
      break
    }
    case ChemicalMimeType.DaylightSmarts: {
      format = SupportedFormat.Smiles
      break
    }
    case ChemicalMimeType.InchI: {
      format = SupportedFormat.InchI
      break
    }
    case ChemicalMimeType.InChIAuxInfo: {
      format = SupportedFormat.InChIAuxInfo
      break
    }
    case ChemicalMimeType.CML: {
      format = SupportedFormat.CML
      break
    }
  }

  return format
}

interface ConvertOptions {
  output_format: ChemicalMimeType
  struct: string
}
class IndigoService implements StructService {
  private defaultOptions: any
  private indigoModule: any

  constructor(defaultOptions: any) {
    this.defaultOptions = defaultOptions
    this.indigoModule = indigoModuleFn()
  }

  async info(): Promise<any> {
    return this.indigoModule.then(indigo => {
      return {
        indigoVersion: indigo.version(),
        imagoVersions: null,
        isAvailable: true
      }
    })
  }

  convert(data: any, options: any): Promise<any> {
    const { output_format, struct }: ConvertOptions = data
    const format = convertMimeTypeToOutputFormat(output_format)
    return this.indigoModule.then(indigo => {
      const indigoOptions = new indigo.map$string$$string$()
      setOptions(indigoOptions, Object.assign({}, this.defaultOptions, options))
      const convertedStruct = indigo.convert(struct, format, indigoOptions)
      return { struct: convertedStruct }
    })
  }

  layout(data: any, options: any): Promise<any> {
    console.log(data)
    console.log(options)
    return Promise.reject('not implemented yet')
  }

  clean(data: any, options: any): Promise<any> {
    console.log(data)
    console.log(options)
    return Promise.reject('not implemented yet')
  }

  aromatize(data: any, options: any): Promise<any> {
    const { struct }: ConvertOptions = data
    return this.indigoModule.then(indigo => {
      const indigoOptions = new indigo.map$string$$string$()
      setOptions(indigoOptions, Object.assign({}, this.defaultOptions, options))
      const aromatizedStruct = indigo.aromatize(struct, indigoOptions)
      return { struct: aromatizedStruct }
    })
  }

  dearomatize(data: any, options: any): Promise<any> {
    const { struct }: ConvertOptions = data
    return this.indigoModule.then(indigo => {
      const indigoOptions = new indigo.map$string$$string$()
      setOptions(indigoOptions, Object.assign({}, this.defaultOptions, options))
      const dearomatizedStruct = indigo.dearomatize(struct, indigoOptions)
      return { struct: dearomatizedStruct }
    })
  }

  calculateCip(data: any, options: any): Promise<any> {
    console.log(data)
    console.log(options)
    return Promise.reject('not implemented yet')
  }

  automap(data: any, options: any): Promise<any> {
    console.log(data)
    console.log(options)
    return Promise.reject('not implemented yet')
  }

  check(data: any, options: any): Promise<any> {
    console.log(data)
    console.log(options)
    return Promise.reject('not implemented yet')
  }

  calculate(data: any, options: any): Promise<any> {
    console.log(data)
    console.log(options)
    return Promise.reject('not implemented yet')
  }

  recognize(blob: any, version: any): Promise<any> {
    console.log(blob)
    console.log(version)
    return Promise.reject('not implemented yet')
  }
}

export default IndigoService
