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
import indigoModuleFn from '../../../generated/libindigo'

interface IndigoOptions {
  set: (key: string, value: string) => void
}

function setOptions(indigoOptions: IndigoOptions, options: CommandOptions) {
  for (let [key, value] of Object.entries(options)) {
    indigoOptions.set(key, (value as any).toString())
  }
}

const module = indigoModuleFn()
self.onmessage = () => (e:MessageEvent<InputMessage<CommandData>>) => {
  const message = e.data
  switch (message.type) {
    case Command.GenerateImageAsBase64: {
      const data: GenerateImageCommandData = message.data as GenerateImageCommandData
      module.then(indigo => {
        const indigoOptions = new indigo.map$string$$string$()
        setOptions(indigoOptions, data.options)
        setOptions(indigoOptions, {'render-output-format': data.outputFormat})
        const updatedStruct = indigo.render(data.struct, indigoOptions)

        const msg: OutputMessage<string> = {
          hasError: false,
          payload: updatedStruct
        }

        // @ts-ignore
        self.postMessage(msg)
      })
      break
    }
    case Command.Layout: {
      const data: LayoutCommandData = message.data as LayoutCommandData
      module.then(indigo => {
        const indigoOptions = new indigo.map$string$$string$()
        setOptions(indigoOptions, data.options)
        const updatedStruct = indigo.layout(data.struct, indigoOptions)

        const msg: OutputMessage<string> = {
          hasError: false,
          payload: updatedStruct
        }

        // @ts-ignore
        self.postMessage(msg)
      })
      break
    }
    case Command.Dearomatize: {
      const data: DearomatizeCommandData = message.data as DearomatizeCommandData
      module.then(indigo => {
        const indigoOptions = new indigo.map$string$$string$()
        setOptions(indigoOptions, data.options)
        const dearomatizedStruct = indigo.dearomatize(
          data.struct,
          indigoOptions
        )

        const msg: OutputMessage<string> = {
          hasError: false,
          payload: dearomatizedStruct
        }

        // @ts-ignore
        self.postMessage(msg)
      })
      break
    }
    case Command.Check: {
      const data: CheckCommandData = message.data as CheckCommandData
      module.then(indigo => {
        const indigoOptions = new indigo.map$string$$string$()
        setOptions(indigoOptions, data.options)
        const warningsString = indigo.check(
          data.struct,
          data.types?.length ? data.types.join(';') : '',
          indigoOptions
        )

        const msg: OutputMessage<string> = {
          hasError: false,
          payload: warningsString
        }

        // @ts-ignore
        self.postMessage(msg)
      })
      break
    }
    case Command.CalculateCip: {
      const data: CalculateCipCommandData = message.data as CalculateCipCommandData
      module.then(indigo => {
        const indigoOptions = new indigo.map$string$$string$()
        setOptions(indigoOptions, data.options)
        const updatedStruct = indigo.calculateCip(data.struct, indigoOptions)

        const msg: OutputMessage<string> = {
          hasError: false,
          payload: updatedStruct
        }

        // @ts-ignore
        self.postMessage(msg)
      })
      break
    }
    case Command.Calculate: {
      const data: CalculateCommandData = message.data as CalculateCommandData
      module.then(indigo => {
        const indigoOptions = new indigo.map$string$$string$()
        setOptions(indigoOptions, data.options)
        const calculatedPropertiesString = indigo.calculate(
          data.struct,
          indigoOptions
        )

        const msg: OutputMessage<string> = {
          hasError: false,
          payload: calculatedPropertiesString
        }

        // @ts-ignore
        self.postMessage(msg)
      })
      break
    }
    case Command.Automap: {
      const data: AutomapCommandData = message.data as AutomapCommandData
      module.then(indigo => {
        const indigoOptions = new indigo.map$string$$string$()
        setOptions(indigoOptions, data.options)
        const updatedStruct = indigo.automap(
          data.struct,
          data.mode,
          indigoOptions
        )

        const msg: OutputMessage<string> = {
          hasError: false,
          payload: updatedStruct
        }

        // @ts-ignore
        self.postMessage(msg)
      })
      break
    }
    case Command.Aromatize: {
      const data: AromatizeCommandData = message.data as AromatizeCommandData
      module.then(indigo => {
        const indigoOptions = new indigo.map$string$$string$()
        setOptions(indigoOptions, data.options)
        const aromatizedStruct = indigo.aromatize(data.struct, indigoOptions)

        const msg: OutputMessage<string> = {
          hasError: false,
          payload: aromatizedStruct
        }

        // @ts-ignore
        self.postMessage(msg)
      })
      break
    }
    case Command.Clean: {
      const data: CleanCommandData = message.data as CleanCommandData
      module.then(indigo => {
        const indigoOptions = new indigo.map$string$$string$()
        setOptions(indigoOptions, data.options)
        const updatedStruct = indigo.clean2d(data.struct, indigoOptions)

        const msg: OutputMessage<string> = {
          hasError: false,
          payload: updatedStruct
        }

        // @ts-ignore
        self.postMessage(msg)
      })
      break
    }
    case Command.Convert: {
      const data: ConvertCommandData = message.data as ConvertCommandData
      module.then(indigo => {
        const indigoOptions = new indigo.map$string$$string$()
        setOptions(indigoOptions, data.options)
        const convertedStruct = indigo.convert(
          data.struct,
          data.format,
          indigoOptions
        )

        const msg: OutputMessage<string> = {
          hasError: false,
          payload: convertedStruct
        }

        // @ts-ignore
        self.postMessage(msg)
      })
      break
    }
    case Command.Info: {
      module.then(indigo => {
        const version = indigo.version()
        const msg: OutputMessage<string> = {
          hasError: false,
          payload: version
        }
        // @ts-ignore
        self.postMessage(msg)
      })
      break
    }
    default:
      throw Error('Unsupported enum type')
  }
})
