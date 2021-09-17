import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ColorPicker from './ColorPicker'

describe('should be rendered correctly', () => {
  it('should be rendered without crashing', () => {
    const { asFragment } = render(<ColorPicker value="#000000" />)
    expect(asFragment(<ColorPicker />)).toMatchSnapshot()
  })
})

describe('should toggle color picker dialog', () => {
  it('should show color picker dialog on click', () => {
    const { container } = render(<ColorPicker />)
    const pickerToggleBtn = screen.getByTestId('color-picker-btn')
    userEvent.click(pickerToggleBtn)
    expect(container.getElementsByClassName('react-colorful')[0]).toBeDefined()
  })

  it('should hide color picker dialog on overlay click', () => {
    const { container } = render(<ColorPicker />)
    const pickerToggleBtn = screen.getByTestId('color-picker-btn')
    userEvent.click(pickerToggleBtn)
    const overlay = screen.getByTestId('color-picker-overlay')
    userEvent.click(overlay)
    expect(
      container.getElementsByClassName('react-colorful')[0]
    ).toBeUndefined()
  })
})

describe('should pick color correctly', () => {
  it('should call onChange callback with picked color', () => {
    const onChange = jest.fn()
    render(<ColorPicker onChange={onChange} />)
    const pickerToggleBtn = screen.getByTestId('color-picker-btn')
    userEvent.click(pickerToggleBtn)
    const colorInput = screen.getByTestId('color-picker-input')
    userEvent.type(colorInput, '#4d4d4d')
    expect(onChange).toBeCalledWith('#4d4d4d')
  })

  it('should display picked color correctly', () => {
    render(<ColorPicker value="#000000" />)
    expect(screen.getByText('#000000')).toBeDefined()
    expect(
      screen.getByTestId('color-picker-preview').style.backgroundColor
    ).toBe('rgb(0, 0, 0)')
  })
})
