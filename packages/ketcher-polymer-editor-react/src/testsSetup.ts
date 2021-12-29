import '@testing-library/jest-dom/extend-expect'

import { createTheme } from '@mui/material/styles'
import { defaultTheme } from 'styles/variables'
import * as reactRedux from 'react-redux'
import { useAppDispatch, useAppSelector } from 'hooks'

const theme = createTheme(defaultTheme)

jest.mock('hooks', () => {
  return {
    useAppTheme: () => theme,
    useAppSelector: jest
      .spyOn(reactRedux, 'useSelector')
      .mockImplementation(() => useAppSelector),
    useAppDispatch: jest
      .spyOn(reactRedux, 'useDispatch')
      // @ts-ignore
      .mockImplementation(() => useAppDispatch)
  }
})
