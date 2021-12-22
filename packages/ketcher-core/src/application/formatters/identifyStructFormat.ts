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

import { SupportedFormat } from './structFormatter.types'

export function identifyStructFormat(
  stringifiedStruct: string
): SupportedFormat {
  // Mimic Indigo/molecule_auto_loader.cpp as much as possible
  const sanitizedString = stringifiedStruct.trim()

  try {
    if (JSON.parse(sanitizedString)) {
      return 'ket'
    }
  } catch (er) {} // eslint-disable-line

  if (sanitizedString.indexOf('$RXN') !== -1) {
    return 'rxn'
  }

  if (sanitizedString.indexOf('V3000') !== -1) {
    return 'molV3000'
  }

  const match = sanitizedString.match(/^(M {2}END|\$END MOL)$/m)

  if (match) {
    const end = (match.index || 0) + match[0].length
    if (
      end === sanitizedString.length ||
      sanitizedString.slice(end, end + 20).search(/^\$(MOL|END CTAB)$/m) !== -1
    ) {
      return 'mol'
    }
  }
  if (
    sanitizedString[0] === '<' &&
    sanitizedString.indexOf('<molecule') !== -1
  ) {
    return 'cml'
  }

  if (sanitizedString.slice(0, 5) === 'InChI') {
    return 'inChI'
  }

  if (sanitizedString.indexOf('\n') === -1) {
    // TODO: smiles regexp
    return 'smiles'
  }

  if (sanitizedString.indexOf('<CDXML') !== -1) {
    return 'cdxml'
  }
  // Molfile by default as Indigo does
  return 'mol'
}
