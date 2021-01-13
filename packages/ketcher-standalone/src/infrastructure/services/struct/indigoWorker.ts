/* eslint-disable no-restricted-globals */
import indigoModuleFn from './../../../generated/libindigo'

const module = indigoModuleFn()

// @ts-ignore
self.addEventListener('message', e => {
  const message = e.data || e

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

    default:
      break
  }
})
