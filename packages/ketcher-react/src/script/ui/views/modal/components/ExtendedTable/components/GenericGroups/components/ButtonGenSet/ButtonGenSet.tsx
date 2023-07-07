/****************************************************************************
 * Copyright 2023 EPAM Systems
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

import clsx from 'clsx';
import { GenItem } from 'ketcher-core';
import classes from './ButtonGenSet.module.less';

type ButtonGenSetProps = {
  button: GenItem;
  onAtomSelect: (label: string, activateImmediately: boolean) => void;
  selected: (label: string) => boolean;
  disabled: boolean;
};

const ButtonGenSet = ({
  button,
  onAtomSelect,
  selected,
  disabled,
}: ButtonGenSetProps) => {
  const titleText = disabled
    ? `${button.label} is disabled`
    : button.description || button.label;

  return (
    <button
      onClick={() => onAtomSelect(button.label, false)}
      onDoubleClick={() => onAtomSelect(button.label, true)}
      title={titleText}
      disabled={disabled}
      className={clsx(
        {
          [classes.selected]: selected(button.label),
        },
        classes.button
      )}
    >
      {button.label}
    </button>
  );
};

export default ButtonGenSet;
