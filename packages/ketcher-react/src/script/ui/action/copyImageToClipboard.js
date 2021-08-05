import { FormatterFactory } from 'ketcher-core'
import { Ketcher } from '../../ketcher'

async function copyImageToClipboard() {
  const state = global.currentState
  const editor = state.editor
  const server = state.server
  const options = state.options
  const struct = editor.structSelected()

  const factory = new FormatterFactory(server)
  const service = factory.create('mol', options)
  const structStr = await service.getStructureFromStructAsync(struct)
  const ketcher = new Ketcher(editor, server, {}, factory)
  const image = await ketcher.generateImageAsync(structStr, {
    outputFormat: 'png'
  })

  try {
    const item = new ClipboardItem({ [image.type]: image }) // eslint-disable-line no-undef
    await navigator.clipboard.write([item])
  } catch (err) {
    alert('This feature is not available in your browser')
  }
}

export default copyImageToClipboard
