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

import { atomCuts, basicAtoms } from '../../../../action/atoms'

import Atom from '../../../../component/view/Atom'
import { Elements } from 'ketcher-core'
import { UiActionAction } from '../../../../action'
import classes from '../../ToolbarGroupItem/ActionButton/ActionButton.module.less'
import clsx from 'clsx'
import { shortcutStr } from '../../shortcutStr'

interface AtomsListProps {
  atoms: string[]
  active?: {
    tool?: string
    opts: {
      label: any
    }
  }
}

interface AtomsListCallProps {
  onAction: (action: UiActionAction) => void
}

type Props = AtomsListProps & AtomsListCallProps

const AtomsList = (props: Props) => {
  const { atoms, active, onAction } = props
  const isAtom = active && active.tool === 'atom'
  return (
    <>
      {atoms.map(label => {
        const element = Elements.get(label)
        const shortcut =
          basicAtoms.indexOf(label) > -1 ? shortcutStr(atomCuts[label]) : null
        return (
          <Atom
            key={label}
            el={element}
            shortcut={shortcut}
            className={clsx(classes.button, {
              [classes.selected]:
                isAtom && active && active.opts.label === label
            })}
            onClick={() => onAction({ tool: 'atom', opts: { label } })}
          />
        )
      })}
    </>
  )
}

export type { AtomsListProps, AtomsListCallProps }
export { AtomsList }
