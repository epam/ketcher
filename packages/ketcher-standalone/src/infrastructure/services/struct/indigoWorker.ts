/* eslint-disable no-restricted-globals */
import indigoModuleFn from './../../../generated/libindigo'
import { Command, OutputMessage } from './indigoWorker.types'

const module = indigoModuleFn()

self.addEventListener('message', e => {
  const message = e.data || e
  console.log('msg to worker: ' + JSON.stringify(e))

  console.log('type: ' + message.type)
  switch (message.type) {
    case 'init':
      module.then(indigo => {
        const version = indigo.version()
        console.log(version)
      })
      console.log('init')
      break

    case 'exec':
      console.log('exec')
      break
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
      break
  }
})
