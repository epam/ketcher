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

export const INVALID = 'invalid';
export type initiallySelectedType = boolean | 'invalid';
export abstract class BaseMicromoleculeEntity {
  initiallySelected?: initiallySelectedType;

  protected constructor(initiallySelected?: initiallySelectedType) {
    this.initiallySelected = initiallySelected;
  }

  getInitiallySelected(): boolean | undefined {
    if (this.initiallySelected === INVALID) {
      throw new Error(
        'this field is used only for serialization/deserialization',
      );
    }
    return this.initiallySelected;
  }

  setInitiallySelected(value?: boolean): void {
    if (this.initiallySelected === INVALID) {
      throw new Error(
        'this field is used only for serialization/deserialization',
      );
    }
    this.initiallySelected = value;
  }

  resetInitiallySelected(invalidate?: boolean): void {
    this.initiallySelected = invalidate ? INVALID : undefined;
  }
}
