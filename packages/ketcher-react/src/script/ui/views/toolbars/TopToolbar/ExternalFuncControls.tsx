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

import { ElementWithDropdown } from './ElementWithDropdown';
import { TopToolbarIconButton } from './TopToolbarIconButton';

interface ExternalFuncProps {
  isCollapsed: boolean;
  onLayout: () => void;
  onExpandMonomers: () => void;
  onClean: () => void;
  onAromatize: () => void;
  onDearomatize: () => void;
  onCalculate: () => void;
  onCheck: () => void;
  onAnalyse: () => void;
  onMiew: () => void;
  onToggleExplicitHydrogens: () => void;
  disabledButtons: string[];
  hiddenButtons: string[];
  indigoVerification: boolean;
  shortcuts: { [key in string]: string };
}

export const ExternalFuncControls = ({
  isCollapsed,
  onLayout,
  onExpandMonomers,
  onClean,
  onAromatize,
  onDearomatize,
  onCalculate,
  onCheck,
  onAnalyse,
  onMiew,
  onToggleExplicitHydrogens,
  disabledButtons,
  indigoVerification,
  hiddenButtons,
  shortcuts,
}: ExternalFuncProps) => {
  const externalFuncButtons = [
    {
      name: 'arom',
      title: 'Aromatize',
      handler: onAromatize,
      testId: 'Aromatize button',
    },
    {
      name: 'dearom',
      title: 'Dearomatize',
      handler: onDearomatize,
      testId: 'Dearomatize button',
    },
    {
      name: 'layout',
      title: 'Layout',
      handler: onLayout,
      testId: 'Layout button',
    },
    {
      name: 'expand-monomers',
      title: 'Expand Monomers',
      handler: onExpandMonomers,
      testId: 'Expand Monomers button',
    },
    {
      name: 'clean',
      title: 'Clean Up',
      handler: onClean,
      testId: 'Clean Up button',
    },
    {
      name: 'cip',
      title: 'Calculate CIP',
      handler: onCalculate,
      testId: 'Calculate CIP button',
    },
    {
      name: 'check',
      title: 'Check Structure',
      handler: onCheck,
      testId: 'Check Structure button',
    },
    {
      name: 'analyse',
      title: 'Calculated Values',
      handler: onAnalyse,
      testId: 'Calculated Values button',
    },
    {
      name: 'explicit-hydrogens',
      title: 'Add/Remove explicit hydrogens',
      handler: onToggleExplicitHydrogens,
      testId: 'Add/Remove explicit hydrogens button',
    },
    {
      name: 'miew',
      title: '3D Viewer',
      handler: onMiew,
      testId: '3D Viewer button',
    },
  ];

  const getButtonElement = (button) => (
    <TopToolbarIconButton
      title={button.title}
      onClick={button.handler}
      iconName={button.name}
      shortcut={shortcuts[button.name]}
      disabled={indigoVerification || disabledButtons.includes(button.name)}
      isHidden={hiddenButtons.includes(button.name)}
      key={button.name}
      testId={button.testId}
    />
  );

  const firstButtonObj = externalFuncButtons.find(
    (button) => !hiddenButtons.includes(button.name),
  );

  const collapsibleElements = externalFuncButtons
    .filter((button) => button !== firstButtonObj)
    .map((button) => getButtonElement(button));

  if (isCollapsed) {
    return (
      <ElementWithDropdown
        topElement={getButtonElement(firstButtonObj)}
        dropDownElements={collapsibleElements}
      />
    );
  }

  return (
    <>
      {firstButtonObj && getButtonElement(firstButtonObj)}
      {<>{collapsibleElements}</>}
    </>
  );
};
