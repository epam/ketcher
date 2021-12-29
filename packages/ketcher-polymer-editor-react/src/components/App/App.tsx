/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { ReactElement, useEffect } from 'react'
import { css } from '@emotion/react'

import { useAppDispatch, useAppSelector, useAppTheme } from 'hooks'
import { selectEditorIsReady, fetchInitData } from 'state/common'
import { MonomerLibrary } from 'components/monomerLibrary'

export const fetchData = () =>
  new Promise((resolve) => {
    setTimeout(() => resolve('some data'), 1000)
  })

export const App = (): ReactElement => {
  const dispatch = useAppDispatch()
  const isReady = useAppSelector(selectEditorIsReady)
  const theme = useAppTheme()

  useEffect(() => {
    dispatch(fetchInitData())
  }, [dispatch])

  const styleContainer = css({
    height: '100%',
    width: '100%',
    position: 'relative',
    padding: '14px 11px 0 11px',
    backgroundColor: theme.colors.background.canvas,
    boxSizing: 'border-box'
  })

  const styleLogo = css({
    fontFamily: theme.fonts.family.montserrat,
    fontSize: theme.fonts.size.medium,
    fontWeight: theme.fonts.weight['600'],
    color: theme.colors.text.gray,
    position: 'absolute',
    bottom: '18px',
    left: '13px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',

    '> span:first-of-type, > span:last-of-type': {
      fontWeight: theme.fonts.weight['300'],
      fontSize: theme.fonts.size.xsmall,
      textTransform: 'uppercase'
    },

    '> span:last-of-type': {
      fontWeight: theme.fonts.weight['400']
    },

    '> span:nth-of-type(2)': {
      color: theme.colors.text.black,

      '&:first-letter': {
        color: theme.colors.text.gray
      }
    }
  })

  if (!isReady) {
    return <div>App is not ready</div>
  }

  return (
    <div css={styleContainer}>
      <MonomerLibrary />

      <div css={styleLogo} data-testid="ketcher-logo">
        <span>Polymer Editor</span>
        <span>Ketcher</span>
        <span>EPAM</span>
      </div>
    </div>
  )
}
