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
    <symbol id="unresolved-monomer-selection">
      <rect
        width="29.5"
        height="29.5"
        x="0.5"
        y="0.5"
        rx="1.5"
        fill="none"
        stroke="#0097A8"
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
  </>
);
