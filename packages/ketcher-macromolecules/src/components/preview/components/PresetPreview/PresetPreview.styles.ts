/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import styled from '@emotion/styled';
import { Icon } from 'ketcher-react';

export const PresetContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: ${(properties) => properties.theme.ketcher.color.background.primary};
  border: ${(properties) => properties.theme.ketcher.border.regular};
  border-radius: ${(properties) => properties.theme.ketcher.border.radius.regular};
  box-shadow: ${(properties) => properties.theme.ketcher.shadow.regular};
`;

export const PresetMonomerRow = styled.div`
  display: flex;
  align-items: center;
`;

export const PresetMonomerLabel = styled.div`
  font-size: ${(properties) => properties.theme.ketcher.font.size.regular};
  line-height: ${(properties) => properties.theme.ketcher.font.size.regular};
  font-weight: 600;
  padding-inline-end: 2px;
`;

export const PresetMonomerName = styled.div`
  color: ${(properties) => properties.theme.ketcher.color.text.lightgrey};
  font-size: ${(properties) => properties.theme.ketcher.font.size.regular};
  font-weight: 400;
  white-space: nowrap;
`;

export const PresetName = styled.p`
  color: ${(properties) => properties.theme.ketcher.color.text.primary};
  font-size: ${(properties) => properties.theme.ketcher.font.size.regular};
  font-weight: 700;
  word-break: break-all;
  text-align: center;
  margin-top: 0;
  margin-bottom: 8px;
`;

export const PresetIcon = styled(Icon)`
  height: 14px;
  width: 14px;
  margin-inline-end: 4px;
  color: ${({ theme }) => theme.ketcher.color.icon.grey};
  stroke: ${({ theme }) => theme.ketcher.color.icon.grey};
`;

// Small variant of the phosphate-position icon used in the RNA Builder's
// phosphate position selector. Reuses the same SVG (`preset-left-phosphate` /
// `preset-right-phosphate`) so the indicator on the preset preview is
// visually consistent with the selector, just smaller.
export const PhosphatePositionIcon = styled(Icon)`
  height: 15px;
  width: 15px;
  flex-shrink: 0;
`;

export const PhosphatePositionIconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  margin-inline-start: 6px;
`;
