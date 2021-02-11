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
/* eslint-disable no-restricted-globals */
import {
  CleanCommandData,
  ConvertCommandData,
  LayoutCommandData,
  Command,
  OutputMessage,
  CommandOptions,
  AromatizeCommandData,
  DearomatizeCommandData,
  CalculateCipCommandData,
  AutomapCommandData,
  CheckCommandData,
  CalculateCommandData,
  InputMessage,
  CommandData,
  GenerateImageCommandData
} from './indigoWorker.types'
// @ts-ignore
import indigoModuleFn from '../../../generated/libindigo'

interface IndigoOptions {
  set: (key: string, value: string) => void
}

type handlerType = (indigo: any, indigoOptions: IndigoOptions) => string

function handle(handler: handlerType, options?: CommandOptions) {
  module.then(indigo => {
    const indigoOptions = new indigo.MapStringString()
    setOptions(indigoOptions, options || {})
    let msg: OutputMessage<string>
    try {
      const payload = handler(indigo, indigoOptions)
      msg = {
        payload,
        hasError: false
      }
    } catch (error) {
      msg = {
        hasError: true,
        error: error
      }
    }

    // @ts-ignore
    self.postMessage(msg)
  })
}

function setOptions(indigoOptions: IndigoOptions, options: CommandOptions) {
  for (let [key, value] of Object.entries(options)) {
    indigoOptions.set(key, (value as any).toString())
  }
}

const module = indigoModuleFn()

self.onmessage = (e: MessageEvent<InputMessage<CommandData>>) => {
  const message = e.data

  switch (message.type) {
    case Command.GenerateImageAsBase64: {
      const data: GenerateImageCommandData = message.data as GenerateImageCommandData
      handle(
        (indigo, indigoOptions) => indigo.render(data.struct, indigoOptions),
        { ...data.options, 'render-output-format': data.outputFormat }
      )
      break
    }

    case Command.Layout: {
      const data: LayoutCommandData = message.data as LayoutCommandData
      handle(
        (indigo, indigoOptions) => indigo.layout(data.struct, indigoOptions),
        data.options
      )
      break
    }

    case Command.Dearomatize: {
      const data: DearomatizeCommandData = message.data as DearomatizeCommandData
      handle(
        (indigo, indigoOptions) =>
          indigo.dearomatize(data.struct, indigoOptions),
        data.options
      )
      break
    }

    case Command.Check: {
      const data: CheckCommandData = message.data as CheckCommandData
      handle(
        (indigo, indigoOptions) =>
          indigo.check(
            data.struct,
            data.types?.length ? data.types.join(';') : '',
            indigoOptions
          ),
        data.options
      )
      break
    }

    case Command.CalculateCip: {
      const data: CalculateCipCommandData = message.data as CalculateCipCommandData
      handle(
        (indigo, indigoOptions) =>
          indigo.calculateCip(data.struct, indigoOptions),
        data.options
      )
      break
    }

    case Command.Calculate: {
      const data: CalculateCommandData = message.data as CalculateCommandData
      handle((indigo, indigoOptions) => {
        const selectedAtoms = new indigo.VectorInt()
        data.selectedAtoms.forEach(atomId => selectedAtoms.push_back(atomId))
        const result = indigo.calculate(
          data.struct,
          indigoOptions,
          selectedAtoms
        )
        return result
      }, data.options)
      break
    }

    case Command.Automap: {
      const data: AutomapCommandData = message.data as AutomapCommandData
      handle(
        (indigo, indigoOptions) =>
          indigo.automap(data.struct, data.mode, indigoOptions),
        data.options
      )
      break
    }

    case Command.Aromatize: {
      const data: AromatizeCommandData = message.data as AromatizeCommandData
      handle(
        (indigo, indigoOptions) => indigo.aromatize(data.struct, indigoOptions),
        data.options
      )
      break
    }

    case Command.Clean: {
      const data: CleanCommandData = message.data as CleanCommandData
      handle((indigo, indigoOptions) => {
        const selectedAtoms = new indigo.VectorInt()
        data.selectedAtoms.forEach(atomId => selectedAtoms.push_back(atomId))
        const updatedStruct = indigo.clean2d(
          data.struct,
          indigoOptions,
          selectedAtoms
        )
        return updatedStruct
      }, data.options)
      break
    }

    case Command.Convert: {
      const data: ConvertCommandData = message.data as ConvertCommandData
      handle(
        (indigo, indigoOptions) =>
          indigo.convert(data.struct, data.format, indigoOptions),
        data.options
      )
      break
    }

    case Command.Info: {
      handle(indigo => indigo.version())
      break
    }

    default:
      throw Error('Unsupported enum type')
  }
}
