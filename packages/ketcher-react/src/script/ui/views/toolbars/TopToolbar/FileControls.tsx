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

import { IconButton } from './IconButton'

interface FileControlsProps {
  onFileOpen: () => void
  onSave: () => void
  shortcuts: { [key in string]: string }
  hiddenButtons: string[]
}

export const FileControls = ({
  onFileOpen,
  onSave,
  shortcuts,
  hiddenButtons
}: FileControlsProps) => {
  return (
    <>
      <IconButton
        title="Open..."
        onClick={onFileOpen}
        iconName="open"
        shortcut={shortcuts.open}
        isHidden={hiddenButtons.includes('open')}
      />
      <IconButton
        title="Save as..."
        onClick={onSave}
        iconName="save"
        shortcut={shortcuts.save}
        isHidden={hiddenButtons.includes('save')}
      />
    </>
  )
}
