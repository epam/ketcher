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

import MuiButton, { ButtonBaseProps } from '@mui/material/ButtonBase'
import styled from '@emotion/styled'
import { css } from '@emotion/react'

const baseButtonStyle = css({
  padding: '5px 8px',
  borderRadius: '2px',
  textTransform: 'none',
  lineHeight: '14px',
  fontSize: '12px',
  textAlign: 'center'
})

const PrimaryButton = styled(MuiButton)(
  ({ theme }) => ({
    backgroundColor: theme.ketcher.color.button.primary.active,
    color: theme.ketcher.color.text.light,
    border: 'none',
    fontWeight: theme.ketcher.font.weight.regular,

    '&:hover': {
      backgroundColor: theme.ketcher.color.button.primary.hover
    },

    '&:disabled': {
      background: theme.ketcher.color.button.primary.disabled,
      opacity: 0.4
    }
  }),
  baseButtonStyle
)

const SecondaryButton = styled(MuiButton)(
  ({ theme }) => ({
    backgroundColor: 'transparent',
    border: `1px solid ${theme.ketcher.color.button.secondary.active}`,
    color: theme.ketcher.color.button.secondary.active,
    fontWeight: theme.ketcher.font.weight.regular,

    '&:hover': {
      border: `1px solid ${theme.ketcher.color.button.secondary.hover}`,
      color: theme.ketcher.color.button.secondary.hover
    },

    '&:disabled': {
      border: `1px solid ${theme.ketcher.color.button.secondary.disabled}`,
      color: theme.ketcher.color.button.secondary.disabled
    },

    '&:clicked': {
      border: `1px solid ${theme.ketcher.color.button.secondary.clicked}`,
      color: theme.ketcher.color.button.secondary.clicked
    }
  }),
  baseButtonStyle
)

type ActionButtonProps = {
  label: string
  clickHandler: () => void
  styleType?: string
} & ButtonBaseProps

export const ActionButton = ({
  label,
  clickHandler,
  styleType,
  ...rest
}: ActionButtonProps) => {
  return styleType === 'secondary' ? (
    <SecondaryButton
      onClick={clickHandler}
      title={rest.title || label}
      role="button"
      {...rest}
    >
      {label}
    </SecondaryButton>
  ) : (
    <PrimaryButton
      onClick={clickHandler}
      title={rest.title || label}
      role="button"
      {...rest}
    >
      {label}
    </PrimaryButton>
  )
}
