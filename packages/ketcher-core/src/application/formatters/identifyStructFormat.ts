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

import { KetcherLogger } from 'utilities';
import { SupportedFormat } from './structFormatter.types';

export function identifyStructFormat(
  stringifiedStruct: string,
  isMacromolecules = false,
): SupportedFormat {
  // Mimic Indigo/molecule_auto_loader.cpp as much as possible
  const sanitizedString = stringifiedStruct.trim();

  try {
    if (JSON.parse(sanitizedString)) {
      return SupportedFormat.ket;
    }
  } catch (e) {
    KetcherLogger.error('identifyStructFormat.ts::identifyStructFromat', e);
  } // eslint-disable-line

  const isRXN = sanitizedString.includes('$RXN');
  const isSDF = sanitizedString.includes('\n$$$$');
  const isV2000 = sanitizedString.includes('V2000');
  const isV3000 = sanitizedString.includes('V3000');

  if (isRXN) {
    return SupportedFormat.rxn;
  }

  if (isSDF) {
    if (isV2000) {
      return SupportedFormat.sdf;
    } else {
      return SupportedFormat.sdfV3000;
    }
  }

  if (isV2000) {
    return SupportedFormat.mol;
  }

  if (isV3000) {
    return SupportedFormat.molV3000;
  }

  const match = sanitizedString.match(/^(M {2}END|\$END MOL)$/m);

  if (match) {
    const end = (match.index || 0) + match[0].length;
    if (
      end === sanitizedString.length ||
      sanitizedString.slice(end, end + 20).search(/^\$(MOL|END CTAB)$/m) !== -1
    ) {
      return SupportedFormat.mol;
    }
  }

  if (
    sanitizedString[0] === '<' &&
    sanitizedString.indexOf('<molecule') !== -1
  ) {
    return SupportedFormat.cml;
  }

  const clearStr = sanitizedString
    .replace(/\s/g, '')
    .replace(/(\\r)|(\\n)/g, '');
  const isBase64String =
    /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
  const cdxHeader = 'VjCD0100';
  if (
    clearStr.length % 4 === 0 &&
    isBase64String.test(clearStr) &&
    window.atob(clearStr).startsWith(cdxHeader)
  ) {
    return SupportedFormat.cdx;
  }

  if (sanitizedString.slice(0, 5) === 'InChI') {
    return SupportedFormat.inChI;
  }

  if (sanitizedString.indexOf('\n') === -1 && !isMacromolecules) {
    // TODO: smiles regexp
    return SupportedFormat.smiles;
  }

  if (sanitizedString.indexOf('<CDXML') !== -1) {
    return SupportedFormat.cdxml;
  }

  if (sanitizedString[0] === '>') {
    return SupportedFormat.fasta;
  }

  const isSequence = /^[a-zA-Z\s\n]*$/.test(sanitizedString);
  const isThreeLetter = /^(?:(?:[A-Z][a-z]{2})\s?)+$/.test(sanitizedString);
  const isIdt = /([a-zA-Z0-9]+)\/*([a-zA-Z0-9*-]+)/.test(sanitizedString);

  if (!isThreeLetter && isIdt) {
    return SupportedFormat.idt;
  } else if (isSequence) {
    return SupportedFormat.sequence;
  }

  return SupportedFormat.unknown;
}
