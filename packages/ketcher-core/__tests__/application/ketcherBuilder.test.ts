import { AssertionError } from 'assert'
import { Editor } from 'application/editor'
import { KetcherBuilder } from 'application/ketcherBuilder'
import { StructServiceProvider } from 'domain/services'
import { mock } from 'jest-mock-extended'

describe('build()', () => {
  it('should throw exception when StructService is null', () => {
    const provider: StructServiceProvider =
      null as unknown as StructServiceProvider
    const editor: Editor = mock<Editor>()
    const builder: KetcherBuilder =
      new KetcherBuilder().withStructServiceProvider(provider)

    expect(() => builder.build(editor)).toThrowError(AssertionError)
  })

  it('should throw exception when Editor is null', () => {
    const provider: StructServiceProvider = mock<StructServiceProvider>()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const editor: Editor = null as any as Editor
    const builder: KetcherBuilder =
      new KetcherBuilder().withStructServiceProvider(provider)

    expect(() => builder.build(editor)).toThrowError(AssertionError)
  })
})
