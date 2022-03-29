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

import { ElementWithDropdown } from './ElementWithDropdown'

import { IconButton } from './IconButton'

interface ExternalFuncProps {
  isCollapsed: boolean
  onLayout: () => void
  onClean: () => void
  onAromatize: () => void
  onDearomatize: () => void
  onCalculate: () => void
  onCheck: () => void
  onAnalyse: () => void
  onMiew: () => void
  disabledButtons: string[]
  hiddenButtons: string[]
  indigoVerification: boolean
  shortcuts: { [key in string]: string }
}

export const ExternalFuncControls = ({
  isCollapsed,
  onLayout,
  onClean,
  onAromatize,
  onDearomatize,
  onCalculate,
  onCheck,
  onAnalyse,
  onMiew,
  disabledButtons,
  indigoVerification,
  hiddenButtons,
  shortcuts
}: ExternalFuncProps) => {
  const TopElement = () => (
    <IconButton
      title="Aromatize"
      onClick={onAromatize}
      iconName="arom"
      shortcut={shortcuts.arom}
      disabled={indigoVerification || disabledButtons.includes('arom')}
    />
  )

  const CollapsibleElements = () => (
    <>
      <IconButton
        title="Dearomatize"
        onClick={onDearomatize}
        iconName="dearom"
        shortcut={shortcuts.dearom}
        disabled={indigoVerification || disabledButtons.includes('dearom')}
        isHidden={hiddenButtons.includes('dearom')}
      />
      <IconButton
        title="Layout"
        onClick={onLayout}
        iconName="layout"
        shortcut={shortcuts.layout}
        disabled={indigoVerification || disabledButtons.includes('layout')}
        isHidden={hiddenButtons.includes('layout')}
      />
      <IconButton
        title="Clean Up"
        onClick={onClean}
        iconName="clean"
        shortcut={shortcuts.clean}
        disabled={indigoVerification || disabledButtons.includes('clean')}
        isHidden={hiddenButtons.includes('clean')}
      />
      <IconButton
        title="Calculate CIP"
        onClick={onCalculate}
        iconName="cip"
        shortcut={shortcuts.cip}
        disabled={indigoVerification || disabledButtons.includes('cip')}
        isHidden={hiddenButtons.includes('cip')}
      />
      <IconButton
        title="Check Structure"
        onClick={onCheck}
        iconName="check"
        shortcut={shortcuts.check}
        disabled={indigoVerification || disabledButtons.includes('check')}
        isHidden={hiddenButtons.includes('check')}
      />
      <IconButton
        title="Calculated Values"
        onClick={onAnalyse}
        iconName="analyse"
        shortcut={shortcuts.analyse}
        disabled={indigoVerification || disabledButtons.includes('analyse')}
        isHidden={hiddenButtons.includes('analyse')}
      />
      <IconButton
        title="3D Viewer"
        onClick={onMiew}
        iconName="miew"
        shortcut={shortcuts.miew}
        disabled={indigoVerification || disabledButtons.includes('miew')}
        isHidden={hiddenButtons.includes('miew')}
      />
    </>
  )

  if (isCollapsed) {
    return (
      <ElementWithDropdown
        topElement={<TopElement />}
        dropDownElements={<CollapsibleElements />}
      />
    )
  }

  return (
    <>
      {<TopElement />}
      {<CollapsibleElements />}
    </>
  )
}
