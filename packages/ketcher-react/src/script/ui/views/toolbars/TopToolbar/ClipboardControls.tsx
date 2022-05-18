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

import { cloneElement } from 'react'
import { IconButton } from './IconButton'
import { ElementWithDropdown } from './ElementWithDropdown'

interface ClipboardControlsProps {
  onCopy: () => void
  onCopyMol: () => void
  onCopyKet: () => void
  onCopyImage: () => void
  onPaste: () => void
  onCut: () => void
  disabledButtons: string[]
  hiddenButtons: string[]
  shortcuts: { [key in string]: string }
}

export const ClipboardControls = ({
  onCopy,
  onCopyMol,
  onCopyKet,
  onCopyImage,
  onPaste,
  onCut,
  shortcuts,
  disabledButtons,
  hiddenButtons
}: ClipboardControlsProps) => {
  const copyButtons = [
    <IconButton
      title="Copy"
      onClick={onCopy}
      iconName="copy"
      shortcut={shortcuts.copy}
      disabled={disabledButtons.includes('copy')}
      isHidden={hiddenButtons.includes('copy')}
    />,
    <IconButton
      title="Copy as MOL"
      onClick={onCopyMol}
      iconName="copy-mol"
      shortcut={shortcuts['copy-mol']}
      disabled={disabledButtons.includes('copy-mol')}
      isHidden={hiddenButtons.includes('copy-mol')}
    />,
    <IconButton
      title="Copy as KET"
      onClick={onCopyKet}
      iconName="copy-ket"
      shortcut={shortcuts['copy-ket']}
      disabled={disabledButtons.includes('copy-ket')}
      isHidden={hiddenButtons.includes('copy-ket')}
    />,
    <IconButton
      title="Copy Image"
      onClick={onCopyImage}
      iconName="copy-image"
      shortcut={shortcuts['copy-image']}
      disabled={disabledButtons.includes('copy-image')}
      isHidden={hiddenButtons.includes('copy-image')}
    />
  ]

  const firstCopyButton = copyButtons.find((button) => !button.props.isHidden)
  const collapsibleElements = copyButtons
    .filter((button) => button !== firstCopyButton)
    .map((button) => cloneElement(button, { key: button.props.title }))

  return (
    <>
      {!hiddenButtons.includes('copies') && (
        <ElementWithDropdown
          topElement={firstCopyButton}
          dropDownElements={collapsibleElements}
        />
      )}
      <IconButton
        title="Paste"
        onClick={onPaste}
        iconName="paste"
        shortcut={shortcuts.paste}
        disabled={disabledButtons.includes('paste')}
        isHidden={hiddenButtons.includes('paste')}
      />
      <IconButton
        title="Cut"
        onClick={onCut}
        iconName="cut"
        shortcut={shortcuts.cut}
        disabled={disabledButtons.includes('cut')}
        isHidden={hiddenButtons.includes('cut')}
      />
    </>
  )
}
