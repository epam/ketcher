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

export const AccordionHeader = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  line-height: 14px;
  color: #333333;
  font-weight: 400;
`;

export const GroupLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;

  svg {
    width: 15px;
    height: 15px;
  }

  span {
    height: 12px;
  }
`;

export const ChangeIndicator = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #167782;
  margin-left: auto;
  margin-right: 8px;
`;
