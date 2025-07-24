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

export const PhosphateAvatar = () => (
  <>
    <symbol id="phosphate" viewBox="0 0 70 70" width="70" height="70">
      <rect
        className="monomer-body"
        width="28"
        height="28"
        data-actual-width="28"
        data-actual-height="28"
        rx="15"
      />
    </symbol>
    <symbol
      id="phosphate-selection"
      viewBox="-1 -1 75 75"
      width="70"
      height="70"
    >
      <rect
        width="28"
        height="28"
        rx="15"
        fill="none"
        stroke="#0097A8"
        strokeWidth="1.5"
      />
    </symbol>
    <symbol id="phosphate-variant" viewBox="0 0 70 70" width="70" height="70">
      <rect
        className="monomer-body"
        width="27"
        height="27"
        data-actual-width="27"
        data-actual-height="27"
        stroke="#585858"
        strokeWidth="0.5"
        x="0.5"
        y="0.5"
        rx="15"
      />
    </symbol>
    <symbol
      id="phosphate-modified-background"
      viewBox="0 0 28 10"
      width="26"
      height="10"
      x="1"
      y="9.5"
    >
      <path
        d="M2.13388 0C1.72465 0 1.35333 0.248229 1.22109 0.635509C0.753639 2.00455 0.5 3.47265 0.5 5C0.5 6.52735 0.753639 7.99545 1.22109 9.36449C1.35333 9.75177 1.72465 10 2.13389 10H25.8661C26.2753 10 26.6467 9.75177 26.7789 9.36449C27.2464 7.99545 27.5 6.52735 27.5 5C27.5 3.47265 27.2464 2.00455 26.7789 0.635509C26.6467 0.248229 26.2753 0 25.8661 0H2.13388Z"
        fill="#333333"
        fillOpacity="0.6"
      />
    </symbol>
    <symbol
      id="phosphate-autochain-preview"
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
