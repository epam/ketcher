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
  WorkerEvent,
  ConvertCommandData,
  DearomatizeCommandData,
  GenerateImageCommandData,
  GenerateInchIKeyCommandData,
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
import EventEmitter from "events";

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

const messageTypeToEventMapping: {
  [key in Command]: WorkerEvent
} = {
  [Command.Info]: 'info',
  [Command.Convert]: 'convert',
  [Command.Layout]: 'layout',
  [Command.Clean]: 'clean',
  [Command.Aromatize]: 'aromatize',
  [Command.Dearomatize]: 'dearomatize',
  [Command.CalculateCip]: 'calculateCip',
  [Command.Automap]: 'automap',
  [Command.Check]: 'check',
  [Command.Calculate]: 'calculate',
  [Command.GenerateImageAsBase64]: 'generateImageAsBase64',
  [Command.GenerateInchIKey]: 'generateInchIKey',
}

class IndigoService implements StructService {
  private readonly defaultOptions: StructServiceOptions
  private readonly worker: IndigoWorker
  private readonly EE: EventEmitter = new EventEmitter()

  constructor(defaultOptions: StructServiceOptions) {
    this.defaultOptions = defaultOptions
    this.worker = new IndigoWorker()
    this.worker.onmessage = (e: MessageEvent<OutputMessage<string>>) => {
      const message: OutputMessage<string> = e.data
      if (message.type !== undefined) {
        const event = messageTypeToEventMapping[message.type];
        console.log(`emitted event ${event}`);
        this.EE.emit(event, { data: message });
      }
    }
  }

  async generateInchIKey(struct: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const action = ({ data }) => {
        const msg: OutputMessage<string> = data
        if (!msg.hasError) {
          resolve(msg.payload || '')
        } else {
          reject(msg.error)
        }
      }

      const inputMessage: InputMessage<GenerateInchIKeyCommandData> = {
        type: Command.GenerateInchIKey,
        data: { struct }
      }

      this.EE.removeListener("generateInchIKey", action)
      this.EE.addListener("generateInchIKey", action)

      this.worker.postMessage(inputMessage)
    })
  }

  info(): Promise<InfoResult> {
    return new Promise((resolve, reject) => {
      const action = ({ data }) => {
        console.log("info action", data)
        const msg: OutputMessage<string> = data
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

      this.EE.removeListener("info", action)
      this.EE.addListener("info", action)

      this.worker.postMessage({ type: Command.Info })
    })
  }

  convert(
    data: ConvertData,
    options?: StructServiceOptions
  ): Promise<ConvertResult> {
    const { output_format, struct } = data
    const format = convertMimeTypeToOutputFormat(output_format)

    return new Promise((resolve, reject) => {
      const action = ({ data }) => {
        console.log("convert action", data)
        const msg: OutputMessage<string> = data
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

      this.EE.removeListener("convert", action)
      this.EE.addListener("convert", action)

      this.worker.postMessage(inputMessage)
    })
  }

  layout(
    data: LayoutData,
    options?: StructServiceOptions
  ): Promise<LayoutResult> {
    const { struct, output_format } = data
    const format = convertMimeTypeToOutputFormat(output_format)

    return new Promise((resolve, reject) => {
      const action = ({ data }) => {
        console.log("layout action", data)
        const msg: OutputMessage<string> = data
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

      this.EE.removeListener("layout", action)
      this.EE.addListener("layout", action)
      
      this.worker.postMessage(inputMessage)
    })
  }

  clean(data: CleanData, options?: StructServiceOptions): Promise<CleanResult> {
    const { struct, selected, output_format } = data
    const format = convertMimeTypeToOutputFormat(output_format)

    return new Promise((resolve, reject) => {
      const action = ({ data }) => {
        const msg: OutputMessage<string> = data
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

      this.EE.removeListener("clean", action)
      this.EE.addListener("clean", action)

      this.worker.postMessage(inputMessage)
    })
  }

  aromatize(
    data: AromatizeData,
    options?: StructServiceOptions
  ): Promise<AromatizeResult> {
    const { struct, output_format } = data
    const format = convertMimeTypeToOutputFormat(output_format)

    return new Promise((resolve, reject) => {
      const action = ({ data }) => {
        const msg: OutputMessage<string> = data
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

      this.EE.removeListener("aromatize", action)
      this.EE.addListener("aromatize", action)
      
      this.worker.postMessage(inputMessage)
    })
  }

  dearomatize(
    data: DearomatizeData,
    options?: StructServiceOptions
  ): Promise<DearomatizeResult> {
    const { struct, output_format } = data
    const format = convertMimeTypeToOutputFormat(output_format)

    return new Promise((resolve, reject) => {
      const action = ({ data }) => {
        const msg: OutputMessage<string> = data
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

      this.EE.removeListener("dearomatize", action)
      this.EE.addListener("dearomatize", action)

      this.worker.postMessage(inputMessage)
    })
  }

  calculateCip(
    data: CalculateCipData,
    options?: StructServiceOptions
  ): Promise<CalculateCipResult> {
    const { struct, output_format } = data
    const format = convertMimeTypeToOutputFormat(output_format)

    return new Promise((resolve, reject) => {
      const action = ({ data }) => {
        const msg: OutputMessage<string> = data
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

      this.EE.removeListener("calculateCip", action)
      this.EE.addListener("calculateCip", action)

      this.worker.postMessage(inputMessage)
    })
  }

  automap(
    data: AutomapData,
    options?: StructServiceOptions
  ): Promise<AutomapResult> {
    const { mode, struct, output_format } = data
    const format = convertMimeTypeToOutputFormat(output_format)

    return new Promise((resolve, reject) => {
      const action = ({ data }) => {
        const msg: OutputMessage<string> = data
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

      this.EE.removeListener("automap", action)
      this.EE.addListener("automap", action)

      this.worker.postMessage(inputMessage)
    })
  }

  check(data: CheckData, options?: StructServiceOptions): Promise<CheckResult> {
    const { types, struct } = data

    return new Promise((resolve, reject) => {
      const action = ({ data }) => {
        const msg: OutputMessage<string> = data
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

      this.EE.removeListener("check", action)
      this.EE.addListener("check", action)

      this.worker.postMessage(inputMessage)
    })
  }

  calculate(
    data: CalculateData,
    options?: StructServiceOptions
  ): Promise<CalculateResult> {
    const { properties, struct, selected } = data
    return new Promise((resolve, reject) => {
      const action = ({ data }) => {
        const msg: OutputMessage<string> = data
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

      this.EE.removeListener("calculate", action)
      this.EE.addListener("calculate", action)

      this.worker.postMessage(inputMessage)
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
      const action = ({ data }) => {
        const msg: OutputMessage<string> = data
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

      this.EE.removeListener("generateImageAsBase64", action)
      this.EE.addListener("generateImageAsBase64", action)

      this.worker.postMessage(inputMessage)
    })
  }
}

export default IndigoService
