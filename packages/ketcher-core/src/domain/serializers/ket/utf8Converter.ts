import * as utf8 from 'utf8'

export function utf8Converter(data, codeType) {
  const content = JSON.parse(data.content)
  content.blocks.map((block) => {
    block.text =
      codeType === 'encode' ? utf8.encode(block.text) : utf8.decode(block.text)
    return block
  })
  data.content = JSON.stringify(content)
  return data
}
