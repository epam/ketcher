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

import React, { useEffect, useState, useCallback } from 'react'
import Markdown from 'react-markdown'
import gfm from 'remark-gfm'
import { useSettingsContext } from '../../../../../../../hooks'
import { Dialog } from '../../../../components'

function Help(props) {
  const [content, setContent] = useState(null)
  const { staticResourcesUrl } = useSettingsContext()
  useEffect(() => {
    const init = async () => {
      fetch(`${staticResourcesUrl}/docs/help.md`)
        .then(response => response.text())
        .then(text => setContent(text))
    }
    init()
  }, [staticResourcesUrl])

  const transfromImageUri = useCallback(
    uri => `${staticResourcesUrl}/docs/${uri}`,
    [staticResourcesUrl]
  )

  return (
    content && (
      <Dialog title="Help" params={props} buttons={['Close']}>
        {content && (
          <Markdown plugins={[gfm]} transformImageUri={transfromImageUri}>
            {content}
          </Markdown>
        )}
      </Dialog>
    )
  )
}

export default Help
