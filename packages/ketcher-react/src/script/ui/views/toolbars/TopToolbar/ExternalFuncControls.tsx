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
  onClean: () => void;
  onAromatize: () => void;
  onDearomatize: () => void;
  onCalculate: () => void;
  onCheck: () => void;
  onAnalyse: () => void;
  onMiew: () => void;
  disabledButtons: string[];
  hiddenButtons: string[];
  indigoVerification: boolean;
  shortcuts: { [key in string]: string };
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
  shortcuts,
}: ExternalFuncProps) => {
  const externalFuncButtons = [
    {
      name: 'arom',
      title: 'Aromatize',
      handler: onAromatize,
    },
    {
      name: 'dearom',
      title: 'Dearomatize',
      handler: onDearomatize,
    },
    {
      name: 'layout',
      title: 'Layout',
      handler: onLayout,
    },
    {
      name: 'clean',
      title: 'Clean Up',
      handler: onClean,
    },
    {
      name: 'cip',
      title: 'Calculate CIP',
      handler: onCalculate,
    },
    {
      name: 'check',
      title: 'Check Structure',
      handler: onCheck,
    },
    {
      name: 'analyse',
      title: 'Calculated Values',
      handler: onAnalyse,
    },
    {
      name: 'miew',
      title: '3D Viewer',
      handler: onMiew,
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
