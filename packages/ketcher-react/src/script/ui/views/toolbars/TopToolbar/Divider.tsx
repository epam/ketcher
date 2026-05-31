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
import style from '../../../../../components/styles/consts';

const VerticalDivider = styled('hr')`
  margin: 0px 6px;
  flex-shrink: 0;
  height: 45%;
  align-self: center;
  border-width: 0px thin 0px 0px;
  border-style: solid;
  border-color: ${style.color.darkGrey};
`;

const HorizontalDividerElement = styled('hr')`
  margin: 6px 0px;
  -webkit-flex-shrink: 0;
  -ms-flex-negative: 0;
  flex-shrink: 0;
  width: 70%;
  -webkit-align-self: center;
  -ms-flex-item-align: center;
  align-self: center;
  border: 1px solid;
  border-color: ${style.color.grey};
`;

export const Divider = () => <VerticalDivider />;

export const HorizontalDivider = () => <HorizontalDividerElement />;
