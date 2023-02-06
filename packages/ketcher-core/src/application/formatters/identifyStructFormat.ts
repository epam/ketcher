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
      return SupportedFormat.ket
    }
  } catch (er) {} // eslint-disable-line

  if (sanitizedString.indexOf('$RXN') !== -1) {
    return SupportedFormat.rxn
  }

  if (sanitizedString.indexOf('V2000') !== -1) {
    return SupportedFormat.mol
  }

  if (sanitizedString.indexOf('V3000') !== -1) {
    return SupportedFormat.molV3000
  }

  const match = sanitizedString.match(/^(M {2}END|\$END MOL)$/m)

  if (match) {
    const end = (match.index || 0) + match[0].length
    if (
      end === sanitizedString.length ||
      sanitizedString.slice(end, end + 20).search(/^\$(MOL|END CTAB)$/m) !== -1
    ) {
      return SupportedFormat.mol
    }
  }

  if (
    sanitizedString[0] === '<' &&
    sanitizedString.indexOf('<molecule') !== -1
  ) {
    return SupportedFormat.cml
  }

  const clearStr = sanitizedString
    .replace(/\s/g, '')
    .replace(/(\\r)|(\\n)/g, '')
  const isBase64String =
    /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/
  const cdxHeader = 'VjCD0100'
  if (
    clearStr.length % 4 === 0 &&
    isBase64String.test(clearStr) &&
    window.atob(clearStr).startsWith(cdxHeader)
  ) {
    return SupportedFormat.cdx
  }

  if (sanitizedString.slice(0, 5) === 'InChI') {
    return SupportedFormat.inChI
  }

  if (sanitizedString.indexOf('\n') === -1) {
    // TODO: smiles regexp
    return SupportedFormat.smiles
  }

  if (sanitizedString.indexOf('<CDXML') !== -1) {
    return SupportedFormat.cdxml
  }

  return SupportedFormat.unknown
}
