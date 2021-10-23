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

import { FC } from 'react'
import { BaseCallProps, BaseProps } from '../../../modal.types'
import classes from './RemoveFG.module.less'
import { useAppContext } from '../../../../../../../hooks'

interface RemoveFGProps extends BaseProps {
  fgIds: any
}

type Props = RemoveFGProps & BaseCallProps

const RemoveFG: FC<Props> = props => {
  const { getKetcherInstance } = useAppContext()
  const editor = getKetcherInstance().editor
  const { fgIds } = props

  const remove = function () {
    // for (let id of fgIds) {
    //     editor.update(
    //         fromSgroupDeletion(editor.render.ctab, id)
    //     )
    // }
    console.log(editor, fgIds)
    return fgIds
  }

  const exit = res => {
    props['onOk'](res)
  }

  return (
    <div
      onSubmit={event => event.preventDefault()}
      tabIndex={-1}
      className={classes.window}>
      <header className={classes.header}>Remove Functional Group</header>
      <div className={classes.question}>
        {' '}
        Are you sure you want to remove chosen Functional Groups to edit unique
        atoms and bonds?
      </div>
      <footer className={classes.footer}>
        <input
          type="button"
          value={'No'}
          className={classes.button_cancel}
          onClick={() => exit(() => null)}
        />
        <input
          type="button"
          value={'Yes'}
          className={classes.button_ok}
          onClick={() => exit(remove())}
        />
      </footer>
    </div>
  )
}

export type { RemoveFGProps }
export { RemoveFG }
