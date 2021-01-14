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
import {
  StructService,
  CheckData,
  AutomapData,
  CalculateCipData,
  DearomatizeData,
  AromatizeData,
  CleanData,
  LayoutData,
  CalculateData,
  ChemicalMimeType,
  SupportedFormat,
  Options,
  InfoResult,
  ConvertData,
  ConvertResult,
  LayoutResult,
  CleanResult,
  AromatizeResult,
  DearomatizeResult,
  CalculateCipResult,
  AutomapResult,
  CheckResult,
  CalculateResult,
  RecognizeResult
} from './structService.types'

interface IndigoOptions {
  set: (key: string, value: string) => void
}
interface KeyValuePair {
  [key: string]: number | string | boolean | object
}

function setOptions(indigoOptions: IndigoOptions, options: Options) {
  for (let [key, value] of Object.entries(options)) {
    indigoOptions.set(key, (value as any).toString())
  }
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

function mapCalculatedPropertyName(property: string) {
  let mappedProperty: string | undefined
  switch (property) {
    case 'gross-formula': {
      mappedProperty = 'gross'
      break
    }
    default:
      mappedProperty = property
      break
  }

  return mappedProperty
}

function mapWarningGroup(property: string) {
  let mappedProperty: string | undefined
  switch (property) {
    case 'OVERLAP_BOND': {
      mappedProperty = 'overlapping_bonds'
      break
    }
    default:
      mappedProperty = property.toLowerCase()
      break
  }

  return mappedProperty
}

class IndigoService implements StructService {
  private defaultOptions: any
  private indigoModule: any

  constructor(defaultOptions: Options) {
    this.defaultOptions = defaultOptions
    this.indigoModule = indigoModuleFn()
  }

  async info(): Promise<InfoResult> {
    return this.indigoModule.then(indigo => {
      const result: InfoResult = {
        indigoVersion: indigo.version(),
        imagoVersions: [],
        isAvailable: true
      }

      return result
    })
  }

  convert(data: ConvertData, options: Options): Promise<ConvertResult> {
    const { output_format, struct } = data
    const format = convertMimeTypeToOutputFormat(output_format)
    return this.service(options, (indigo, indigoOptions) => {
      const convertedStruct = indigo.convert(struct, format, indigoOptions)
      const result: ConvertResult = {
        struct: convertedStruct,
        format: output_format
      }
      return result
    })
  }

  layout(data: LayoutData, options: Options): Promise<LayoutResult> {
    const { struct } = data
    return this.service(options, (indigo, indigoOptions) => {
      const updatedStruct = indigo.layout(struct, indigoOptions)
      const result: LayoutResult = {
        struct: updatedStruct,
        format: ChemicalMimeType.Mol
      }
      return result
    })
  }

  clean(data: CleanData, options: Options): Promise<CleanResult> {
    //TODO: very slow
    const { struct } = data
    return this.service(options, (indigo, indigoOptions) => {
      const updatedStruct = indigo.clean2d(struct, indigoOptions)
      const result: CleanResult = {
        struct: updatedStruct,
        format: ChemicalMimeType.Mol
      }
      return result
    })
  }

  aromatize(data: AromatizeData, options: Options): Promise<AromatizeResult> {
    const { struct } = data
    return this.service(options, (indigo, indigoOptions) => {
      const aromatizedStruct = indigo.aromatize(struct, indigoOptions)
      const result: AromatizeResult = {
        struct: aromatizedStruct,
        format: ChemicalMimeType.Mol
      }
      return result
    })
  }

  dearomatize(
    data: DearomatizeData,
    options: Options
  ): Promise<DearomatizeResult> {
    const { struct } = data
    return this.service(options, (indigo, indigoOptions) => {
      const dearomatizedStruct = indigo.dearomatize(struct, indigoOptions)
      const result: AromatizeResult = {
        struct: dearomatizedStruct,
        format: ChemicalMimeType.Mol
      }
      return result
    })
  }

  calculateCip(
    data: CalculateCipData,
    options: Options
  ): Promise<CalculateCipResult> {
    const { struct } = data
    return this.service(options, (indigo, indigoOptions) => {
      const updatedStruct = indigo.calculateCip(struct, indigoOptions)
      const result: CalculateCipResult = {
        struct: updatedStruct,
        format: ChemicalMimeType.Mol
      }
      return result
    })
  }

  automap(data: AutomapData, options: Options): Promise<AutomapResult> {
    const { mode, struct } = data
    return this.service(options, (indigo, indigoOptions) => {
      const updatedStruct = indigo.automap(struct, mode, indigoOptions)
      const result: AutomapResult = {
        struct: updatedStruct,
        format: ChemicalMimeType.Mol
      }
      return result
    })
  }

  check(data: CheckData, options: Options): Promise<CheckResult> {
    const { types, struct } = data
    return this.service(options, (indigo, indigoOptions) => {
      const warningsString = indigo.check(
        struct,
        types?.length ? types.join(';') : '',
        indigoOptions
      )

      const warnings = JSON.parse(warningsString) as KeyValuePair

      const result: CheckResult = Object.entries(warnings).reduce(
        (acc, curr) => {
          const [key, value] = curr
          const mappedPropertyName = mapWarningGroup(key)
          acc[mappedPropertyName] = value['message']

          return acc
        },
        {}
      )
      return result
    })
  }

  calculate(data: CalculateData, options: Options): Promise<CalculateResult> {
    const { properties, struct } = data
    return this.service(options, (indigo, indigoOptions) => {
      const calculatedPropertiesString = indigo.calculate(struct, indigoOptions)
      const calculatedProperties = JSON.parse(
        calculatedPropertiesString
      ) as KeyValuePair
      const result: CalculateResult = Object.entries(
        calculatedProperties
      ).reduce((acc, curr) => {
        const [key, value] = curr
        const mappedPropertyName = mapCalculatedPropertyName(key)
        if (properties.includes(mappedPropertyName)) {
          acc[mappedPropertyName] = value
        }

        return acc
      }, {})

      return result
    })
  }

  // @ts-ignore
  recognize(blob: Blob, version: string): Promise<RecognizeResult> {
    return Promise.reject('not implemented yet')
  }

  generatePng(data: string, options: Options): Promise<string> {
    return this.service(options, (service, indigoOptions) => {
      if (typeof service.render !== 'function') {
        if (process.env.MODE === 'development') {
          console.warn('Indigo service')
        }
        return undefined
      }

      indigoOptions.set('render-output-format', 'png')
      return service.render(data, indigoOptions)
    })
  }

  private service<TResponse = void>(
    options: Options,
    callback: (service, indigoOptions?) => any
  ): Promise<TResponse> {
    return this.indigoModule.then(service => {
      const indigoOptions = new service.map$string$$string$()
      setOptions(indigoOptions, Object.assign({}, this.defaultOptions, options))
      return callback(service, indigoOptions)
    })
  }
}

export default IndigoService
