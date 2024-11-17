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

export const RNABaseAvatar = () => (
  <>
    <symbol id="rna-base" viewBox="-16 0 65 65" width="65" height="95">
      <rect
        width="22.5"
        height="22.5"
        data-actual-width="31.82"
        data-actual-height="31.82"
        rx="1"
        x="-11.25"
        y="-11.25"
        transform="rotate(45)"
        className="monomer-body"
      />
    </symbol>
    <symbol
      id="rna-base-selection"
      viewBox="-15.75 -0.25 65 65"
      width="65"
      height="95"
    >
      <rect
        width="21"
        height="21"
        rx="1"
        x="-10.5"
        y="-10.5"
        transform="rotate(45)"
        stroke="#0097A8"
        strokeWidth="1.5"
        fill="none"
      />
    </symbol>
    <symbol id="rna-base-variant" viewBox="-16 0 65 65" width="65" height="94">
      <rect
        width="21.5"
        height="21.5"
        data-actual-width="30"
        data-actual-height="30"
        stroke="#585858"
        strokeWidth="0.5"
        rx="1"
        x="-10.25"
        y="-10.25"
        transform="rotate(45)"
        className="monomer-body"
      />
    </symbol>
    <symbol
      id="rna-base-modified-background"
      viewBox="0 0 32 10"
      width="30"
      height="9"
      x="1"
      y="11"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.30156 10C6.03634 10 5.78199 9.89464 5.59445 9.70711L1.1508 5.26346C0.760279 4.87293 0.760279 4.23977 1.1508 3.84924L4.70715 0.292893C4.89469 0.105357 5.14904 0 5.41426 0H26.5858C26.851 0 27.1054 0.105357 27.2929 0.292893L30.8493 3.84924C31.2398 4.23977 31.2398 4.87293 30.8493 5.26346L26.4056 9.70711C26.2181 9.89464 25.9637 10 25.6985 10H6.30156Z"
        fill="#333333"
        fillOpacity="0.6"
      />
    </symbol>
  </>
);
