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

import { useAppDispatch, useAppSelector } from 'hooks';
import {
  isMacromoleculesPropertiesWindowOpened,
  selectEditor,
  selectIsMacromoleculesPropertiesWindowOpened,
  selectMonomers,
  setMacromoleculesProperties,
  setMacromoleculesPropertiesWindowVisibility,
} from 'state/common';
import styled from '@emotion/styled';
import { Button, IndigoProvider } from 'ketcher-react';
import { blurActiveElement } from 'helpers/canvas';
import { KetSerializer, Struct, StructService } from 'ketcher-core';
import { useRecalculateMacromoleculeProperties } from '../../hooks/useRecalculateMacromoleculeProperties';

const StyledButton = styled(Button)<{ isActive?: boolean }>(
  ({ theme, isActive }) => ({
    width: '28px',
    height: '28px',
    backgroundColor: isActive
      ? theme.ketcher.color.button.group.active
      : 'white',
    margin: '2px',
    padding: '0',
    borderRadius: '4px',
    outline: 'none',

    ':hover': {
      backgroundColor: isActive
        ? theme.ketcher.color.button.group.hover
        : 'white',
    },

    ':hover svg': {
      fill: isActive ? 'white' : theme.ketcher.color.button.group.active,
    },
  }),
);

export const CalculateMacromoleculePropertiesButton = () => {
  const dispatch = useAppDispatch();
  const editor = useAppSelector(selectEditor);
  const isMacromoleculesPropertiesWindowOpened = useAppSelector(
    selectIsMacromoleculesPropertiesWindowOpened,
  );
  const recalculateMacromoleculeProperties =
    useRecalculateMacromoleculeProperties();

  const handleClick = async () => {
    const isMacromoleculesPropertiesWindowOpenedNewState =
      !isMacromoleculesPropertiesWindowOpened;

    await recalculateMacromoleculeProperties();
    dispatch(
      setMacromoleculesPropertiesWindowVisibility(
        isMacromoleculesPropertiesWindowOpenedNewState,
      ),
    );

    blurActiveElement();
  };

  return (
    <StyledButton
      isActive={isMacromoleculesPropertiesWindowOpened}
      onClick={handleClick}
    >
      <svg
        width="15"
        height="16"
        viewBox="0 0 15 16"
        xmlns="http://www.w3.org/2000/svg"
        fill={isMacromoleculesPropertiesWindowOpened ? 'white' : '#333333'}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.87727 1.65517H9.03053V4.46737L9.42288 5.12973C9.76799 5.04496 10.1287 5 10.5 5C12.9853 5 15 7.01472 15 9.5C15 10.6812 14.5449 11.7562 13.8004 12.559C14.4936 14.1572 13.3016 16 11.456 16H2.54694C0.627617 16 -0.60048 14.0008 0.302223 12.3451C1.6087 9.94883 3.5345 6.39671 4.51457 4.49368V1.65517H3.66783V0H9.87727V1.65517ZM12.2962 13.6272C11.746 13.867 11.1385 14 10.5 14C8.01472 14 6 11.9853 6 9.5C6 7.98987 6.74386 6.65348 7.88515 5.83725L7.33705 4.91194V1.65517H6.20806V4.88502L6.11866 5.05976C5.15873 6.93619 3.14099 10.658 1.79676 13.1235C1.49524 13.6765 1.9056 14.3448 2.54694 14.3448H11.456C11.9075 14.3448 12.2417 14.0139 12.2962 13.6272ZM13.5375 9.5C13.5375 11.1776 12.1776 12.5375 10.5 12.5375C8.82244 12.5375 7.4625 11.1776 7.4625 9.5C7.4625 7.82243 8.82244 6.4625 10.5 6.4625C12.1776 6.4625 13.5375 7.82243 13.5375 9.5Z"
        />
      </svg>
    </StyledButton>
  );
};
