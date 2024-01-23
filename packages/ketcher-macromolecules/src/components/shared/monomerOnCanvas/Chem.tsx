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

export const ChemAvatar = () => (
  <>
    <symbol id="chem" viewBox="0 0 59 59" width="59" height="59">
      <rect
        className="monomer-body"
        width="29.5"
        height="29.5"
        x="0.5"
        y="0.5"
        rx="0.75"
        fill="#F5F6F7"
      />
    </symbol>
    <symbol id="chem-selection" viewBox="0 0 59 59" width="59" height="59">
      <rect
        width="29.5"
        height="29.5"
        x="0.5"
        y="0.5"
        rx="0.75"
        stroke="#0097A8"
        fill="none"
        strokeWidth="1.5"
      />
    </symbol>
  </>
);
