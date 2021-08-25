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
import React, { FC, useState } from 'react'

import { formatProperties } from 'ketcher-core'
import { Dialog } from '../../../../components'
import OpenButton from '../../../../../component/view/openbutton'
import ClipArea from '../../../../../component/cliparea/cliparea'
import { BaseProps, BaseCallProps } from '../../../modal.types'

import classes from './Open.module.less'

interface OpenProps {
  server: any
}

type Props = OpenProps & Pick<BaseProps, 'className'> & BaseCallProps

const Open: FC<Props> = props => {
  const [structStr, setStructStr] = useState<string>('')
  const [fragment, setFragment] = useState<boolean>(false)
  const { server, ...rest } = props

  const result = () => {
    return structStr ? { structStr, fragment } : null
  }

  const structAcceptMimes = () => {
    return Object.keys(formatProperties)
      .reduce(
        (res, key) =>
          res.concat(
            formatProperties[key].mime,
            ...formatProperties[key].extensions
          ),
        []
      )
      .join(',')
  }

  return (
    <Dialog
      title="Open Structure"
      className={classes.open}
      result={result}
      params={rest}
      buttons={[
        <OpenButton
          key={structAcceptMimes().toString()}
          server={server}
          type={structAcceptMimes()}
          onLoad={setStructStr}>
          Open From File…
        </OpenButton>,
        'Cancel',
        'OK'
      ]}>
      <textarea
        value={structStr}
        onChange={event => setStructStr(event.target.value)}
      />
      <label>
        <input
          type="checkbox"
          checked={fragment}
          onChange={event => setFragment(event.target.checked)}
        />
        Load as a fragment and copy to the Clipboard
      </label>
      <ClipArea
        focused={() => true}
        onCopy={() => ({ 'text/plain': structStr })}
      />
    </Dialog>
  )
}

export type { OpenProps }
export default Open
