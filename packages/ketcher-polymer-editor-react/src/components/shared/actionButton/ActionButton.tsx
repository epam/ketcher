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

const Button = styled(MuiButton)(({ theme }) => ({
  backgroundColor: theme.ketcher.color.button.primary.active,
  color: theme.ketcher.color.text.light,
  padding: '5px 16px',
  border: 'none',
  borderRadius: '2px',
  textTransform: 'none',
  lineHeight: '14px',
  fontSize: '12px',
  textAlign: 'center',

  '&:hover': {
    backgroundColor: theme.ketcher.color.button.primary.hover
  },

  '&:disabled': {
    background: theme.ketcher.color.button.primary.disabled,
    opacity: 0.4
  }
}))

type ActionButtonProps = {
  label: string
  clickHandler: () => void
} & ButtonBaseProps

export const ActionButton = ({
  label,
  clickHandler,
  children,
  ...rest
}: ActionButtonProps) => {
  return (
    <Button
      onClick={clickHandler}
      title={rest.title || label}
      role="button"
      {...rest}
    >
      {children || label}
    </Button>
  )
}
