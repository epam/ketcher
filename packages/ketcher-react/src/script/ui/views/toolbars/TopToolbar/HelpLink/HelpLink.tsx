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

import Icon from '../../../../component/view/icon'
import { shortcutStr } from '../../shortcutStr'
import classes from './HelpLink.module.less'

const HelpLink = ({ status }) => {
  if (status?.hidden) {
    return null
  }
  console.log(JSON.stringify(process.env.HELP_LINK))
  const shortcut = shortcutStr(['?', '&', 'Shift+/'])
  const helpLink = process.env.HELP_LINK

  return (
    <a
      target="_blank"
      className={classes.button}
      title={`Help (${shortcut})`}
      href={`https://github.com/epam/ketcher/blob/${helpLink}/example/public/docs/help.md#ketcher-overview`}
      rel="noreferrer"
    >
      <Icon name="help" />
      <kbd>{shortcut}</kbd>
    </a>
  )
}

export { HelpLink }
