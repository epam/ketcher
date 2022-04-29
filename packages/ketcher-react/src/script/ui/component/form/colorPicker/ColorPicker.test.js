import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ColorPicker from './ColorPicker'

const openPreset = () => {
  const presetToggleBtn = screen.getByTestId('color-picker-preview')
  userEvent.click(presetToggleBtn)
}
const openPalette = () => {
  const pickerToggleBtn = screen.getByTestId('color-picker-btn')
  userEvent.click(pickerToggleBtn)
}

describe('should be rendered correctly', () => {
  it('should be rendered without crashing', () => {
    const { asFragment } = render(<ColorPicker value="#000000" />)
    expect(asFragment(<ColorPicker />)).toMatchSnapshot()
  })
})

describe('should toggle color picker dialog', () => {
  it('should show color preset on click', () => {
    const { container } = render(<ColorPicker />)
    openPreset()
    expect(
      container.getElementsByClassName('classes.colorPickerWrap')
    ).toBeDefined()
  })

  it('should show color picker dialog on click', () => {
    const { container } = render(<ColorPicker />)
    openPreset()
    openPalette()
    expect(container.getElementsByClassName('react-colorful')[0]).toBeDefined()
  })

  it('should hide color picker dialog on click outside picker', async () => {
    const { container } = render(<ColorPicker />)
    openPreset()
    openPalette()
    const overlay = screen.getByTestId('color-picker-field')
    await new Promise((resolve) => {
      setTimeout(() => {
        userEvent.click(overlay)
        resolve()
      }, 300)
    })

    expect(
      container.getElementsByClassName('react-colorful')[0]
    ).toBeUndefined()
  })
})

describe('should pick color correctly', () => {
  it('should call onChange callback with picked color', () => {
    const onChange = jest.fn()
    render(<ColorPicker onChange={onChange} />)
    openPreset()
    openPalette()
    const colorInput = screen.getByTestId('color-picker-input')
    userEvent.type(colorInput, '#4d4d4d')
    expect(onChange).toBeCalledWith('#4d4d4d')
  })

  it('should display picked color correctly', () => {
    render(<ColorPicker value="#000000" />)
    expect(
      screen.getByTestId('color-picker-preview').style.backgroundColor
    ).toBe('rgb(0, 0, 0)')
  })
})
