/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { KetcherLogger } from 'utilities';
import { SupportedFormat } from './structFormatter.types';

function isIdtString(s: string): boolean {
  // Phosphorothioate nucleotide sequence: A, C, G, T, U joined by *
  const idtBaseSeq = /^[ACGTUacgtu](\*[ACGTUacgtu])+$/;
  // IDT modification token: /3Name/, /5Name/, /iName/, /rName/
  const idtModToken = /\/[35ir][A-Za-z0-9][A-Za-z0-9-]*\/?/;
  return idtBaseSeq.test(s) || idtModToken.test(s);
}

// A molfile without a version line ends with `M  END` (or `$END MOL`), at the
// end of the input or right before the next record
function isMolfileWithoutVersion(struct: string): boolean {
  const match = /^(M {2}END|\$END MOL)$/m.exec(struct);

  if (!match) {
    return false;
  }

  const end = (match.index ?? 0) + match[0].length;

  return (
    end === struct.length ||
    struct.slice(end, end + 20).search(/^\$(MOL|END CTAB)$/m) !== -1
  );
}

// Reactions, RDF and SD files and molfiles
function identifyMdlFormat(struct: string): SupportedFormat | undefined {
  if (struct.includes('$RXN')) {
    return SupportedFormat.rxn;
  }

  // An RDF file without reactions is not a molfile: a molfile cannot start
  // with the $RDFILE tag, so Indigo decides how to read it (#5273)
  if (struct.startsWith('$RDFILE')) {
    return SupportedFormat.unknown;
  }

  const isV2000 = struct.includes('V2000');

  if (struct.includes('\n$$$$')) {
    return isV2000 ? SupportedFormat.sdf : SupportedFormat.sdfV3000;
  }

  if (isV2000) {
    return SupportedFormat.mol;
  }

  if (struct.includes('V3000')) {
    return SupportedFormat.molV3000;
  }

  return isMolfileWithoutVersion(struct) ? SupportedFormat.mol : undefined;
}

function isBase64Cdx(struct: string): boolean {
  const clearStr = struct
    .split(/\s+/)
    .join('')
    .replaceAll(String.raw`\r`, '')
    .replaceAll(String.raw`\n`, '');
  const base64StringPattern =
    /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
  const cdxHeader = 'VjCD0100';

  return (
    clearStr.length % 4 === 0 &&
    base64StringPattern.test(clearStr) &&
    globalThis.atob(clearStr).startsWith(cdxHeader)
  );
}

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
  } catch (error) {
    KetcherLogger.error('identifyStructFormat.ts::identifyStructFromat', error);
  }

  const mdlFormat = identifyMdlFormat(sanitizedString);

  if (mdlFormat !== undefined) {
    return mdlFormat;
  }

  if (
    sanitizedString.startsWith('<') &&
    sanitizedString.includes('<molecule')
  ) {
    return SupportedFormat.cml;
  }

  if (isBase64Cdx(sanitizedString)) {
    return SupportedFormat.cdx;
  }

  if (sanitizedString.startsWith('InChI')) {
    return SupportedFormat.inChI;
  }

  if (sanitizedString.includes('<CDXML')) {
    return SupportedFormat.cdxml;
  }

  if (sanitizedString.startsWith('>')) {
    return SupportedFormat.fasta;
  }

  if (isIdtString(sanitizedString)) {
    return SupportedFormat.idt;
  }

  if (!isMacromolecules && !sanitizedString.includes('\n')) {
    // TODO: smiles regexp
    return SupportedFormat.smiles;
  }

  const isSequence = /^[a-zA-Z\s]*$/.test(sanitizedString);
  const isThreeLetter = /^(?:(?:[A-Z][a-z]{2})\s?)+$/.test(sanitizedString);

  if (!isThreeLetter && isSequence) {
    return SupportedFormat.sequence;
  }

  return SupportedFormat.unknown;
}
