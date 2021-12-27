import { MonomerItem } from './MonomerItem'
import { render, fireEvent } from 'utils'

describe('Test Monomer Item component', () => {
  it('Test click event', () => {
    const monomerItemHandleClick = jest.fn()
    const monomer = { name: 'L' }
    const { container } = render(
      MonomerItem({ key: 1, item: monomer, onClick: monomerItemHandleClick })
    )
    const div = container.querySelector('div')
    // @ts-ignore
    fireEvent.click(div)

    expect(monomerItemHandleClick.mock.calls.length).toEqual(1)
  })
})
