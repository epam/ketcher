import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { MonomerItem } from './MonomerItem'

describe('Test Monomer Item component', () => {
  it('Test click event', () => {
    const monomerItemHandleClick = jest.fn()
    const monomer = { label: 'L' }
    render(
      withThemeProvider(
        <MonomerItem key={1} item={monomer} onClick={monomerItemHandleClick} />
      )
    )

    const div = screen.getByText('L')
    userEvent.click(div)

    expect(monomerItemHandleClick.mock.calls.length).toEqual(1)
  })
})
