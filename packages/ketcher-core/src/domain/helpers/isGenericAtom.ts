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

import { genericsList } from 'domain/constants/generics';

/**
 * Returns true if the given label is a generic / pseudo query atom label
 * (e.g. A, AH, Q, QH, M, MH, X, XH, *, R, G, ALK, ARY, …) as defined in
 * the Ketcher Generics table.
 *
 * Atom-list marker labels ('L', 'L#') are NOT generics — they represent a set
 * of element alternatives encoded in the atomList property.
 */
export function isGenericAtom(label: string): boolean {
  return genericsList.includes(label);
}
