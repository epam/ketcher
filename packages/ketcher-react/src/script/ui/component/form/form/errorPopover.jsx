/****************************************************************************
 * Copyright 2022 EPAM Systems
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

import { forwardRef } from 'react'
import { Popover } from '@mui/material'
import styled from '@emotion/styled'

const ErrorMessage = styled(Popover)`
  & .MuiPopover-paper {
    padding: 0 8px;
    box-shadow: 4px 0px, 2px rgba(0, 0, 0, 0.25);
    font-size: 12px;
    max-width: 160px;
  }
`

export const ErrorPopover = ({ error, anchorEl, handleClose, open = true }) => (
  <ErrorMessage
    id="form-error"
    open={open}
    anchorEl={anchorEl}
    disableAutoFocus
    sx={{
      pointerEvents: 'none'
    }}
    onClose={handleClose}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'center'
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'left'
    }}
  >
    <>
      {/* <p style={{ color: 'red' }}>Will work properly if:</p>  TODO: uncomment when error messages are changed */}
      <p>{error}</p>
    </>
  </ErrorMessage>
)
