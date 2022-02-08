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

const PrimaryButton = styled(MuiButton)(({ theme }) => ({
  backgroundColor: theme.color.button.primary.active,
  color: theme.color.text.light,
  padding: '5px 8px',
  border: 'none',
  borderRadius: '2px',
  textTransform: 'none',
  lineHeight: '14px',
  fontSize: '12px',
  textAlign: 'center',
  fontWeight: theme.font.weight.regular,

  '&:hover': {
    backgroundColor: theme.ketcher.color.button.primary.hover
  },

  '&:disabled': {
    background: theme.ketcher.color.button.primary.disabled,
    opacity: 0.4
  }
}))

const SecondaryButton = styled(MuiButton)(({ theme }) => ({
  backgroundColor: 'transparent',
  padding: '5px 8px',
  border: `1px solid ${theme.color.button.secondary.active}`,
  color: theme.color.button.secondary.active,
  borderRadius: '2px',
  textTransform: 'none',
  lineHeight: '14px',
  fontSize: '12px',
  textAlign: 'center',
  fontWeight: theme.font.weight.regular,

  '&:hover': {
    border: `1px solid ${theme.color.button.secondary.hover}`,
    color: theme.color.button.secondary.hover
  },

  '&:disabled': {
    border: `1px solid ${theme.color.button.secondary.disabled}`,
    color: theme.color.button.secondary.disabled
  },

  '&:clicked': {
    border: `1px solid ${theme.color.button.secondary.clicked}`,
    color: theme.color.button.secondary.clicked
  }
}))

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
