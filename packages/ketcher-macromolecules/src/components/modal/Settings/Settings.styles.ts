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

import styled from '@emotion/styled';

export const HeaderIconButton = styled.button`
  background-color: transparent;
  border: none;
  color: ${({ theme }) => theme.ketcher.color.icon.active};
  padding: 0;
  font-size: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${({ theme }) => theme.ketcher.color.icon.hover};
  }

  &:disabled {
    color: ${({ theme }) => theme.ketcher.color.icon.disabled};
    cursor: not-allowed;
  }
`;

/** Set ACS Settings sits in the title row next to the icon controls */
export const HeaderTextButton = styled.button`
  background-color: ${({ theme }) => theme.ketcher.color.background.primary};
  border: 1px solid ${({ theme }) => theme.ketcher.color.text.secondary};
  border-radius: 4px;
  color: ${({ theme }) => theme.ketcher.color.text.secondary};
  height: 20px;
  padding: 0 6px;
  font-size: 10px;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.ketcher.color.text.primary};
    color: ${({ theme }) => theme.ketcher.color.text.primary};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

/**
 * Covers the canvas area while the Settings window is open. It is fully
 * transparent, so the structure stays visible, but it swallows every pointer
 * event so the canvas cannot be modified.
 */
export const CanvasCaptureLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 5;
  background: transparent;
`;
