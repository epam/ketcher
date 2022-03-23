/****************************************************************************
 * Copyright 2021 EPAM Systems
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

import {
  AromatizeCommandData,
  AutomapCommandData,
  CalculateCipCommandData,
  CalculateCommandData,
  CalculateProps,
  CheckCommandData,
  CleanCommandData,
  Command,
  CommandOptions,
  ConvertCommandData,
  DearomatizeCommandData,
  GenerateImageCommandData,
  InputMessage,
  LayoutCommandData,
  OutputMessage,
  SupportedFormat
} from './indigoWorker.types'
import {
  AromatizeData,
  AromatizeResult,
  AutomapData,
  AutomapResult,
  CalculateCipData,
  CalculateCipResult,
  CalculateData,
  CalculateResult,
  CheckData,
  CheckResult,
  ChemicalMimeType,
  CleanData,
  CleanResult,
  ConvertData,
  ConvertResult,
  DearomatizeData,
  DearomatizeResult,
  GenerateImageOptions,
  InfoResult,
  LayoutData,
  LayoutResult,
  RecognizeResult,
  StructService,
  StructServiceOptions
} from 'ketcher-core'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import IndigoWorker from 'web-worker:./indigoWorker'

interface KeyValuePair {
  [key: string]: number | string | boolean | object
}

function convertMimeTypeToOutputFormat(
  mimeType: ChemicalMimeType
): SupportedFormat {
  let format: SupportedFormat
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
      format = SupportedFormat.Smarts
      break
    }
    case ChemicalMimeType.InChI: {
      format = SupportedFormat.InChI
      break
    }
    case ChemicalMimeType.InChIKey: {
      format = SupportedFormat.InChIKey
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
    case ChemicalMimeType.KET: {
      format = SupportedFormat.Ket
      break
    }
    case ChemicalMimeType.CDXML: {
      format = SupportedFormat.CDXML
      break
    }
    default: {
      throw new Error('Unsupported chemical mime type')
    }
  }

  return format
}

function mapCalculatedPropertyName(property: CalculateProps) {
  let mappedProperty: CalculateProps | undefined
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
  private readonly defaultOptions: StructServiceOptions

  constructor(defaultOptions: StructServiceOptions) {
    this.defaultOptions = defaultOptions
  }

  info(): Promise<InfoResult> {
    return new Promise((resolve, reject) => {
      const worker: Worker = new IndigoWorker()

      worker.onmessage = (e: MessageEvent<OutputMessage<string>>) => {
        worker.terminate()
        const msg: OutputMessage<string> = e.data
        if (!msg.hasError) {
          const result: InfoResult = {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            indigoVersion: msg.payload!,
            imagoVersions: [],
            isAvailable: true
          }
          resolve(result)
        } else {
          reject(msg.error)
        }
      }

      worker.postMessage({ type: Command.Info })
    })
  }

  convert(
    data: ConvertData,
    options?: StructServiceOptions
  ): Promise<ConvertResult> {
    const { output_format, struct } = data
    const format = convertMimeTypeToOutputFormat(output_format)

    return new Promise((resolve, reject) => {
      const worker: Worker = new IndigoWorker()

      worker.onmessage = (e: MessageEvent<OutputMessage<string>>) => {
        worker.terminate()
        const msg: OutputMessage<string> = e.data
        if (!msg.hasError) {
          const result: ConvertResult = {
            struct: msg.payload!,
            format: output_format
          }
          resolve(result)
        } else {
          reject(msg.error)
        }
      }

      const commandOptions: CommandOptions = {
        ...this.defaultOptions,
        ...options
      }

      const commandData: ConvertCommandData = {
        struct,
        format,
        options: commandOptions
      }

      const inputMessage: InputMessage<ConvertCommandData> = {
        type: Command.Convert,
        data: commandData
      }

      worker.postMessage(inputMessage)
    })
  }

  layout(
    data: LayoutData,
    options?: StructServiceOptions
  ): Promise<LayoutResult> {
    const { struct, output_format } = data
    const format = convertMimeTypeToOutputFormat(output_format)

    return new Promise((resolve, reject) => {
      const worker: Worker = new IndigoWorker()

      worker.onmessage = (e: MessageEvent<OutputMessage<string>>) => {
        worker.terminate()
        const msg: OutputMessage<string> = e.data
        if (!msg.hasError) {
          const result: LayoutResult = {
            struct: msg.payload!,
            format: ChemicalMimeType.Mol
          }
          resolve(result)
        } else {
          reject(msg.error)
        }
      }

      const commandOptions: CommandOptions = {
        ...this.defaultOptions,
        ...options
      }

      const commandData: LayoutCommandData = {
        struct,
        format,
        options: commandOptions
      }

      const inputMessage: InputMessage<LayoutCommandData> = {
        type: Command.Layout,
        data: commandData
      }

      worker.postMessage(inputMessage)
    })
  }

  clean(data: CleanData, options?: StructServiceOptions): Promise<CleanResult> {
    const { struct, selected, output_format } = data
    const format = convertMimeTypeToOutputFormat(output_format)

    return new Promise((resolve, reject) => {
      const worker: Worker = new IndigoWorker()

      worker.onmessage = (e: MessageEvent<OutputMessage<string>>) => {
        worker.terminate()
        const msg: OutputMessage<string> = e.data
        if (!msg.hasError) {
          const result: CleanResult = {
            struct: msg.payload!,
            format: ChemicalMimeType.Mol
          }
          resolve(result)
        } else {
          reject(msg.error)
        }
      }

      const commandOptions: CommandOptions = {
        ...this.defaultOptions,
        ...options
      }

      const commandData: CleanCommandData = {
        struct,
        format,
        options: commandOptions,
        selectedAtoms: selected || []
      }

      const inputMessage: InputMessage<CleanCommandData> = {
        type: Command.Clean,
        data: commandData
      }

      worker.postMessage(inputMessage)
    })
  }

  aromatize(
    data: AromatizeData,
    options?: StructServiceOptions
  ): Promise<AromatizeResult> {
    const { struct, output_format } = data
    const format = convertMimeTypeToOutputFormat(output_format)

    return new Promise((resolve, reject) => {
      const worker: Worker = new IndigoWorker()

      worker.onmessage = (e: MessageEvent<OutputMessage<string>>) => {
        worker.terminate()
        const msg: OutputMessage<string> = e.data
        if (!msg.hasError) {
          const result: AromatizeResult = {
            struct: msg.payload!,
            format: ChemicalMimeType.Mol
          }
          resolve(result)
        } else {
          reject(msg.error)
        }
      }

      const commandOptions: CommandOptions = {
        ...this.defaultOptions,
        ...options
      }

      const commandData: AromatizeCommandData = {
        struct,
        format,
        options: commandOptions
      }

      const inputMessage: InputMessage<AromatizeCommandData> = {
        type: Command.Aromatize,
        data: commandData
      }

      worker.postMessage(inputMessage)
    })
  }

  dearomatize(
    data: DearomatizeData,
    options?: StructServiceOptions
  ): Promise<DearomatizeResult> {
    const { struct, output_format } = data
    const format = convertMimeTypeToOutputFormat(output_format)

    return new Promise((resolve, reject) => {
      const worker: Worker = new IndigoWorker()

      worker.onmessage = (e: MessageEvent<OutputMessage<string>>) => {
        worker.terminate()
        const msg: OutputMessage<string> = e.data
        if (!msg.hasError) {
          const result: AromatizeResult = {
            struct: msg.payload!,
            format: ChemicalMimeType.Mol
          }
          resolve(result)
        } else {
          reject(msg.error)
        }
      }

      const commandOptions: CommandOptions = {
        ...this.defaultOptions,
        ...options
      }

      const commandData: DearomatizeCommandData = {
        struct,
        format,
        options: commandOptions
      }

      const inputMessage: InputMessage<DearomatizeCommandData> = {
        type: Command.Dearomatize,
        data: commandData
      }

      worker.postMessage(inputMessage)
    })
  }

  calculateCip(
    data: CalculateCipData,
    options?: StructServiceOptions
  ): Promise<CalculateCipResult> {
    const { struct, output_format } = data
    const format = convertMimeTypeToOutputFormat(output_format)

    return new Promise((resolve, reject) => {
      const worker: Worker = new IndigoWorker()

      worker.onmessage = (e: MessageEvent<OutputMessage<string>>) => {
        worker.terminate()
        const msg: OutputMessage<string> = e.data
        if (!msg.hasError) {
          const result: CalculateCipResult = {
            struct: msg.payload!,
            format: ChemicalMimeType.Mol
          }
          resolve(result)
        } else {
          reject(msg.error)
        }
      }

      const commandOptions: CommandOptions = {
        ...this.defaultOptions,
        ...options
      }

      const commandData: CalculateCipCommandData = {
        struct,
        format,
        options: commandOptions
      }

      const inputMessage: InputMessage<CalculateCipCommandData> = {
        type: Command.CalculateCip,
        data: commandData
      }

      worker.postMessage(inputMessage)
    })
  }

  automap(
    data: AutomapData,
    options?: StructServiceOptions
  ): Promise<AutomapResult> {
    const { mode, struct, output_format } = data
    const format = convertMimeTypeToOutputFormat(output_format)

    return new Promise((resolve, reject) => {
      const worker: Worker = new IndigoWorker()

      worker.onmessage = (e: MessageEvent<OutputMessage<string>>) => {
        worker.terminate()
        const msg: OutputMessage<string> = e.data
        if (!msg.hasError) {
          const result: AutomapResult = {
            struct: msg.payload!,
            format: ChemicalMimeType.Mol
          }
          resolve(result)
        } else {
          reject(msg.error)
        }
      }

      const commandOptions: CommandOptions = {
        ...this.defaultOptions,
        ...options
      }

      const commandData: AutomapCommandData = {
        struct,
        format,
        mode,
        options: commandOptions
      }

      const inputMessage: InputMessage<CalculateCipCommandData> = {
        type: Command.Automap,
        data: commandData
      }

      worker.postMessage(inputMessage)
    })
  }

  check(data: CheckData, options?: StructServiceOptions): Promise<CheckResult> {
    const { types, struct } = data

    return new Promise((resolve, reject) => {
      const worker: Worker = new IndigoWorker()

      worker.onmessage = (e: MessageEvent<OutputMessage<string>>) => {
        worker.terminate()
        const msg: OutputMessage<string> = e.data
        if (!msg.hasError) {
          const warnings = JSON.parse(msg.payload!) as KeyValuePair

          const result: CheckResult = Object.entries(warnings).reduce(
            (acc, curr) => {
              const [key, value] = curr
              const mappedPropertyName = mapWarningGroup(key)
              acc[mappedPropertyName] = value

              return acc
            },
            {}
          )
          resolve(result)
        } else {
          reject(msg.error)
        }
      }

      const commandOptions: CommandOptions = {
        ...this.defaultOptions,
        ...options
      }

      const commandData: CheckCommandData = {
        struct,
        types,
        options: commandOptions
      }

      const inputMessage: InputMessage<CheckCommandData> = {
        type: Command.Check,
        data: commandData
      }

      worker.postMessage(inputMessage)
    })
  }

  calculate(
    data: CalculateData,
    options?: StructServiceOptions
  ): Promise<CalculateResult> {
    const { properties, struct, selected } = data
    return new Promise((resolve, reject) => {
      const worker: Worker = new IndigoWorker()

      worker.onmessage = (e: MessageEvent<OutputMessage<string>>) => {
        worker.terminate()
        const msg: OutputMessage<string> = e.data
        if (!msg.hasError) {
          const calculatedProperties: CalculateResult = JSON.parse(msg.payload!)
          const result: CalculateResult = Object.entries(
            calculatedProperties
          ).reduce((acc, curr) => {
            const [key, value] = curr
            const mappedPropertyName = mapCalculatedPropertyName(
              key as CalculateProps
            )
            if (properties.includes(mappedPropertyName)) {
              acc[mappedPropertyName] = value
            }

            return acc
          }, {} as CalculateResult)
          resolve(result)
        } else {
          reject(msg.error)
        }
      }

      const commandOptions: CommandOptions = {
        ...this.defaultOptions,
        ...options
      }

      const commandData: CalculateCommandData = {
        struct,
        properties,
        options: commandOptions,
        selectedAtoms: selected || []
      }

      const inputMessage: InputMessage<CalculateCommandData> = {
        type: Command.Calculate,
        data: commandData
      }

      worker.postMessage(inputMessage)
    })
  }

  recognize(_blob: Blob, _version: string): Promise<RecognizeResult> {
    return Promise.reject(new Error('Not supported in standalone mode'))
  }

  generateImageAsBase64(
    data: string,
    options: GenerateImageOptions = { outputFormat: 'png', backgroundColor: '' }
  ): Promise<string> {
    const { outputFormat, backgroundColor, ...restOptions } = options
    return new Promise((resolve, reject) => {
      const worker: Worker = new IndigoWorker()

      worker.onmessage = (e: MessageEvent<OutputMessage<string>>) => {
        worker.terminate()
        const msg: OutputMessage<string> = e.data
        if (!msg.hasError) {
          resolve(msg.payload!)
        } else {
          reject(msg.error)
        }
      }

      const commandOptions: CommandOptions = {
        ...this.defaultOptions,
        ...restOptions
      }

      const commandData: GenerateImageCommandData = {
        struct: data,
        outputFormat: outputFormat || 'png',
        backgroundColor: backgroundColor,
        options: commandOptions
      }

      const inputMessage: InputMessage<GenerateImageCommandData> = {
        type: Command.GenerateImageAsBase64,
        data: commandData
      }

      worker.postMessage(inputMessage)
    })
  }
}

export default IndigoService
