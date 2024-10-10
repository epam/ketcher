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
  </>
);
