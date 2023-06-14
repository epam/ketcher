import { render, screen, fireEvent } from '@testing-library/react'
import { Struct } from 'ketcher-core'
import { MonomerItem } from './MonomerItem'
import { MonomerItemType } from './types'

describe('Test Monomer Item component', () => {
  it('Test click event', () => {
    const monomerItemHandleClick = jest.fn()
    const monomer: MonomerItemType = {
      label: 'for test',
      props: {
        MonomerNaturalAnalogCode: 'L'
      },
      struct: new Struct()
    }
    render(
      withThemeAndStoreProvider(
        <MonomerItem key={1} item={monomer} onClick={monomerItemHandleClick} />
      )
    )

    const div = screen.getByTestId(monomer.props.MonomerNaturalAnalogCode)
    fireEvent.click(div)

    expect(monomerItemHandleClick.mock.calls.length).toEqual(1)
  })
})
