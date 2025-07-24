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

export const SugarAvatar = () => (
  <>
    <symbol id="sugar" viewBox="0 0 70 70" width="70" height="70">
      <rect
        className="monomer-body"
        width="28.5"
        height="28.5"
        data-actual-width="28.5"
        data-actual-height="28.5"
        rx="5"
      />
    </symbol>
    <symbol id="sugar-selection" viewBox="-1 -1 100 100" width="70" height="70">
      <rect
        width="39"
        height="39"
        rx="5"
        fill="none"
        stroke="#0097A8"
        strokeWidth="2.5"
      />
    </symbol>
    <symbol id="sugar-variant" viewBox="0 0 72 72" width="70" height="70">
      <rect
        className="monomer-body"
        width="28.5"
        height="28.5"
        data-actual-width="28.5"
        data-actual-height="28.5"
        x="0.5"
        y="0.5"
        rx="5"
        stroke="#585858"
        strokeWidth="0.5"
      />
    </symbol>
    <symbol
      id="sugar-modified-background"
      viewBox="0 0 28 10"
      width="27"
      height="10"
      x="0.7"
      y="10"
    >
      <path
        d="M1.5 10C0.947715 10 0.5 9.55229 0.5 9V1C0.5 0.447715 0.947715 0 1.5 0H26.5C27.0523 0 27.5 0.447715 27.5 1V9C27.5 9.55228 27.0523 10 26.5 10H1.5Z"
        fill="white"
        fillOpacity="0.6"
      />
    </symbol>
    <symbol
      id="sugar-autochain-preview"
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
