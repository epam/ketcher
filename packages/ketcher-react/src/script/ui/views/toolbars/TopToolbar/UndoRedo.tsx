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

import { Divider } from './Divider'
import { IconButton } from './IconButton'

interface UndoRedoProps {
  disabledButtons: string[]
  shortcuts: { [key in string]: string }
  onUndo: () => void
  onRedo: () => void
}

export const UndoRedo = ({
  onUndo,
  onRedo,
  disabledButtons,
  shortcuts
}: UndoRedoProps) => {
  return (
    <>
      <Divider />
      <IconButton
        title="Undo"
        onClick={onUndo}
        iconName="undo"
        disabled={disabledButtons.includes('undo')}
        shortcut={shortcuts.undo}
      />
      <IconButton
        title="Redo"
        onClick={onRedo}
        iconName="redo"
        disabled={disabledButtons.includes('redo')}
        shortcut={shortcuts.redo}
      />
      <Divider />
    </>
  )
}
