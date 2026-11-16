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

import { cloneElement, type ReactElement } from 'react';
import MuiTooltip from '@mui/material/Tooltip';
import type { ITooltipProps } from './types';

export const Tooltip = ({
  title,
  children,
  placement = 'bottom',
}: ITooltipProps) => {
  const child = children as ReactElement<{
    title?: string;
    disabled?: boolean;
  }>;

  if (!title) {
    return child;
  }

  if (child.props.disabled) {
    return cloneElement(child, { title });
  }

  return (
    <MuiTooltip
      title={title}
      placement={placement}
      describeChild
      disableInteractive
    >
      {child}
    </MuiTooltip>
  );
};
