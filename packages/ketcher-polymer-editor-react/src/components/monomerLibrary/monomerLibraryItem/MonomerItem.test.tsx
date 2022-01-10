import { MonomerItem } from './MonomerItem'
import { render, screen } from 'test-utils'
import userEvent from '@testing-library/user-event'

describe('Test Monomer Item component', () => {
  it('Test click event', () => {
    const monomerItemHandleClick = jest.fn()
    const monomer = { name: 'L' }
    render(
      <MonomerItem key={1} item={monomer} onClick={monomerItemHandleClick} />
    )

    const div = screen.getByText('L')
    // @ts-ignore
    userEvent.click(div)

    expect(monomerItemHandleClick.mock.calls.length).toEqual(1)
  })
})
