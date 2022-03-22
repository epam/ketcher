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

import { useResizeObserver } from 'src/hooks'
import { FileControls } from './FileControls'
import { ClipboardControls } from './ClipboardControls'
import { UndoRedo } from './UndoRedo'
import { ZoomControls } from './ZoomControls'

import { SystemControls } from './SystemControls'
import { IconButton } from './IconButton'
import { ExternalFuncControls } from './ExternalFuncControls'

type VoidFunction = () => void

export interface PanelProps {
  className: string
  disabledButtons: string[]
  indigoVerification: boolean
  hiddenButtons: string[]
  shortcuts: { [key in string]: string }
  onClear: VoidFunction
  onFileOpen: VoidFunction
  onSave: VoidFunction
  onUndo: VoidFunction
  onRedo: VoidFunction
  onCopy: VoidFunction
  onCopyMol: VoidFunction
  onCopyKet: VoidFunction
  onCopyImage: VoidFunction
  onCut: VoidFunction
  onPaste: VoidFunction
  currentZoom: number | undefined
  setZoom: (arg: number) => void
  onZoomIn: VoidFunction
  onZoomOut: VoidFunction
  onSettingsOpen: VoidFunction
  onLayout: VoidFunction
  onClean: VoidFunction
  onAromatize: VoidFunction
  onDearomatize: VoidFunction
  onCalculate: VoidFunction
  onCheck: VoidFunction
  onAnalyse: VoidFunction
  onMiew: VoidFunction
}

const collapseLimit = 900

const ControlsPanel = styled('div')`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0px;
  height: 36px;

  .group {
    display: flex;
    flex-direction: row;
    gap: 0px;
  }

  & * {
    box-sizing: border-box;
  }

  @media only screen and (min-width: 1024px) {
    height: 40px;
    gap: 4px;

    .group {
      gap: 4px;
    }
  }

  @media only screen and (min-width: 1920px) {
    height: 64px;
    gap: 12px;
  }
`

export const TopToolbar = ({
  className,
  disabledButtons,
  indigoVerification,
  hiddenButtons,
  shortcuts,
  onClear,
  onFileOpen,
  onSave,
  onUndo,
  onRedo,
  onCopy,
  onCopyMol,
  onCopyKet,
  onCopyImage,
  onCut,
  onPaste,
  currentZoom,
  setZoom,
  onZoomIn,
  onZoomOut,
  onSettingsOpen,
  onLayout,
  onClean,
  onAromatize,
  onDearomatize,
  onCalculate,
  onCheck,
  onAnalyse,
  onMiew
}: PanelProps) => {
  const { ref: resizeRef, width = 50 } = useResizeObserver<HTMLDivElement>()

  return (
    <ControlsPanel className={className} ref={resizeRef}>
      <IconButton
        title="Clear Canvas"
        onClick={onClear}
        iconName="clear"
        shortcut={shortcuts.clear}
      />
      <FileControls
        onFileOpen={onFileOpen}
        onSave={onSave}
        shortcuts={shortcuts}
      />
      <ClipboardControls
        onCopy={onCopy}
        onCopyMol={onCopyMol}
        onCopyKet={onCopyKet}
        onCopyImage={onCopyImage}
        onPaste={onPaste}
        onCut={onCut}
        shortcuts={shortcuts}
        disabledButtons={disabledButtons}
      />
      <UndoRedo
        onUndo={onUndo}
        onRedo={onRedo}
        disabledButtons={disabledButtons}
        shortcuts={shortcuts}
      />
      <ExternalFuncControls
        onLayout={onLayout}
        onClean={onClean}
        onAromatize={onAromatize}
        onDearomatize={onDearomatize}
        onCalculate={onCalculate}
        onCheck={onCheck}
        onAnalyse={onAnalyse}
        onMiew={onMiew}
        disabledButtons={disabledButtons}
        hiddenButtons={hiddenButtons}
        shortcuts={shortcuts}
        indigoVerification={indigoVerification}
        isCollapsed={width < collapseLimit}
      />
      <ZoomControls
        zoom={currentZoom || 1}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        setZoom={setZoom}
        shortcuts={shortcuts}
        disabledButtons={disabledButtons}
      />
      <SystemControls
        onHistoryClick={() => {
          console.log('History button clicked')
        }}
        onSettingsOpen={onSettingsOpen}
        disabledButtons={disabledButtons}
        hiddenButtons={hiddenButtons}
      />
    </ControlsPanel>
  )
}
