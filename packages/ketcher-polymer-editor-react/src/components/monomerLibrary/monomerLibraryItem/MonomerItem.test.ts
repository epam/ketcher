import { MonomerItem } from './MonomerItem'
import { render, fireEvent, screen } from '@testing-library/react'

describe.skip('Test Monomer Item component', () => {
  it('Test click event', () => {
    const monomerItemHandleClick = jest.fn()
    const monomer = { name: 'L' }
    render(
      MonomerItem({ key: 1, item: monomer, onClick: monomerItemHandleClick })
    )
    const div = screen.getByRole('div')
    // @ts-ignore
    fireEvent.click(div)

    expect(monomerItemHandleClick.mock.calls.length).toEqual(1)
  })
})
