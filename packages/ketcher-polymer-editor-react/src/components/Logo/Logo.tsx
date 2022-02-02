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

import styled from '@emotion/styled'

const StyledLogo = styled.div(({ theme }) => ({
  fontFamily: theme.font.family.montserrat,
  fontSize: theme.font.size.medium,
  fontWeight: theme.font.weight.bold,
  color: theme.color.text.secondary,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  height: 'auto',
  position: 'absolute',
  bottom: '15px',
  left: '13px',

  '> span:first-of-type, > span:last-of-type': {
    fontWeight: theme.font.weight.light,
    fontSize: theme.font.size.xsmall,
    textTransform: 'uppercase'
  },

  '> span:last-of-type': {
    fontWeight: theme.font.weight.regular
  },

  '> span:nth-of-type(2)': {
    color: theme.color.text.primary,

    '&:first-letter': {
      color: theme.color.text.secondary
    }
  }
}))

export const Logo = () => {
  return (
    <StyledLogo>
      <span>Polymer Editor</span>
      <span>Ketcher</span>
      <span>EPAM</span>
    </StyledLogo>
  )
}
