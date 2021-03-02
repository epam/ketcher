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
// @ts-ignore
import IndigoWorker from 'web-worker:./IndigoWorker'
import {
  Command,
  OutputMessage,
  InputMessage,
  SupportedFormat,
  CleanCommandData,
  ConvertCommandData,
  LayoutCommandData,
  AromatizeCommandData,
  DearomatizeCommandData,
  CommandOptions,
  CalculateCipCommandData,
  AutomapCommandData,
  CheckCommandData,
  CalculateCommandData,
  GenerateImageCommandData
} from './indigoWorker.types'

import {
  StructService,
  ChemicalMimeType,
  CheckData,
  AutomapData,
  CalculateCipData,
  DearomatizeData,
  AromatizeData,
  CleanData,
  LayoutData,
  CalculateData,
  StructServiceOptions,
  GenerateImageOptions,
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
  // @ts-ignore
} from 'ketcher-core'

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
    case ChemicalMimeType.InChIAuxInfo: {
      format = SupportedFormat.InChIAuxInfo
      break
    }
    case ChemicalMimeType.CML: {
      format = SupportedFormat.CML
      break
    }
    default: {
      throw new Error('Unsupported chemical mime type')
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
    const { struct } = data

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
    const { struct, selected } = data
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
    const { struct } = data

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
    const { struct } = data

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
    const { struct } = data
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
    const { mode, struct } = data

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
          const calculatedProperties = JSON.parse(msg.payload!) as KeyValuePair
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

  // @ts-ignore
  recognize(blob: Blob, version: string): Promise<RecognizeResult> {
    return Promise.reject('Not supported in standalone mode')
  }

  generateImageAsBase64(
    data: string,
    options: GenerateImageOptions = { outputFormat: 'png' }
  ): Promise<string> {
    const { outputFormat, ...restOptions } = options

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
