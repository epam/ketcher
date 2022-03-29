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

import Icon from '../../../component/view/icon'
import { shortcutStr } from '../shortcutStr'

const Link = styled('a')`
  display: block;
  color: #333;
  border: 0;
  position: relative;
  background: inherit;

  flex-shrink: 0;

  border-radius: 4px;
  margin: 0px;
  padding: 2px;
  height: 28px;
  width: 28px;

  &:hover {
    color: #005662;
    transform: none;
    box-shadow: none;
    transition: none;
    background: none;
  }

  &:active {
    background-color: #005662;
    color: white;
  }

  & svg {
    width: 100%;
    height: 100%;
  }

  @media only screen and (min-width: 1024px) {
    height: 32px;
    width: 32px;
    padding: 4px;
  }

  @media only screen and (min-width: 1920px) {
    height: 40px;
    width: 40px;
    padding: 5px;
  }
`

const HelpLink = ({ isHidden }: { isHidden: boolean }) => {
  if (isHidden) {
    return null
  }
  const shortcut = shortcutStr(['?', '&', 'Shift+/'])
  const helpLink = process.env.HELP_LINK

  return (
    <Link
      target="_blank"
      title={`Help (${shortcut})`}
      href={`https://github.com/epam/ketcher/blob/${helpLink}/documentation/help.md#ketcher-overview`}
      rel="noreferrer">
      <Icon name="help" />
    </Link>
  )
}

export { HelpLink }
