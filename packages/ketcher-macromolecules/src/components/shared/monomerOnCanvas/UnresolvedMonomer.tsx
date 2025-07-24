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

export const UnresolvedMonomerAvatar = () => (
  <>
    <symbol id="unresolved-monomer" viewBox="0 0 59 59" width="59" height="59">
      <rect
        className="monomer-body"
        width="29.5"
        height="29.5"
        data-actual-width="29.5"
        data-actual-height="29.5"
        x="0.5"
        y="0.5"
        rx="1.5"
        stroke="#333333"
      />
      <rect
        width="29.5"
        height="29.5"
        data-actual-width="29.5"
        data-actual-height="29.5"
        x="0.5"
        y="0.5"
        rx="1.5"
        fill="#585858"
      />
    </symbol>
    <symbol id="unresolved-monomer-hover">
      <rect
        width="29.5"
        height="29.5"
        x="0.5"
        y="0.5"
        rx="1.5"
        fill="none"
        stroke="#0097A8"
        strokeWidth="1.5"
      />
    </symbol>
    <symbol
      id="unresolved-monomer-autochain-preview"
      viewBox="0 0 32 32"
      width="32"
      height="32"
      data-actual-width="32"
      data-actual-height="32"
    >
      <path d="M0.99585 5V3C0.99585 1.89543 1.89128 1 2.99585 1H4.99585" />
      <path d="M0.99585 27V29C0.99585 30.1046 1.89128 31 2.99585 31H4.99585" />
      <path d="M30.9958 5V3C30.9958 1.89543 30.1004 1 28.9958 1H26.9958" />
      <path d="M30.9958 27V29C30.9958 30.1046 30.1004 31 28.9958 31H26.9958" />
      <path d="M2.99585 1L28.9959 1" stroke-dasharray="4 4" />
      <path
        d="M30.9958 3L30.9959 29"
        stroke-miterlimit="16"
        stroke-dasharray="4 4"
      />
      <path d="M2.99585 31L28.9959 31" stroke-dasharray="4 4" />
      <path d="M0.99585 3L0.995851 29" stroke-dasharray="4 4" />
    </symbol>
  </>
);
