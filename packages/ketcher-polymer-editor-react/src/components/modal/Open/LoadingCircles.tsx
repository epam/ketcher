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
import styled from '@emotion/styled'

const LoadContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  width: 40px;
  height: 12px;
  margin-top: 10px;

  & span {
    display: inline-block;
    width: 8px;
    height: 8px;
    border: 2px solid ${({ theme }) => theme.color.spinner};
    border-radius: 100%;
    box-sizing: border-box;

    &:nth-of-type(1) {
      animation: bounce 1s ease-in-out infinite;
    }

    &:nth-of-type(2) {
      animation: bounce 1s ease-in-out 0.33s infinite;
    }

    &:nth-of-type(3) {
      animation: bounce 1s ease-in-out 0.66s infinite;
    }
  }

  @keyframes bounce {
    0%,
    75%,
    100% {
      -webkit-transform: translateY(0);
      -ms-transform: translateY(0);
      -o-transform: translateY(0);
      transform: translateY(0);
    }

    25% {
      -webkit-transform: translateY(-100%);
      -ms-transform: translateY(-100%);
      -o-transform: translateY(-100%);
      transform: translateY(-100%);
    }
  }
`
export const LoadingCircles = () => (
  <LoadContainer>
    <span />
    <span />
    <span />
  </LoadContainer>
)
