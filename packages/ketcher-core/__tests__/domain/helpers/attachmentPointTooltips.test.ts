/****************************************************************************
 * Copyright 2026 EPAM Systems
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

import { getAttachmentPointTooltip } from 'domain/helpers/attachmentPointTooltips';
import { KetMonomerClass } from 'domain/constants/monomers';
import { AttachmentPointName } from 'domain/types';

describe('getAttachmentPointTooltip', () => {
  it.each([
    [KetMonomerClass.Sugar, AttachmentPointName.R1, "5'"],
    [KetMonomerClass.Sugar, AttachmentPointName.R2, "3'"],
    [KetMonomerClass.Phosphate, AttachmentPointName.R1, "5'"],
    [KetMonomerClass.Phosphate, AttachmentPointName.R2, "3'"],
    [KetMonomerClass.RNA, AttachmentPointName.R1, "5'"],
    [KetMonomerClass.RNA, AttachmentPointName.R2, "3'"],
    [KetMonomerClass.Sugar, AttachmentPointName.R3, null],
    [KetMonomerClass.Base, AttachmentPointName.R1, null],
  ])('returns tooltip for %s %s', (monomerClass, ap, expected) => {
    expect(getAttachmentPointTooltip(monomerClass, ap)).toBe(expected);
  });

  it.each([
    ['sugar', AttachmentPointName.R1, "5'"],
    ['phosphate', AttachmentPointName.R2, "3'"],
    ['sugar', AttachmentPointName.R2, null],
    ['phosphate', AttachmentPointName.R1, null],
    ['base', AttachmentPointName.R1, null],
  ] as const)(
    'returns tooltip for RNA preset component %s %s',
    (rnaComponentKey, ap, expected) => {
      expect(getAttachmentPointTooltip('rnaPreset', ap, rnaComponentKey)).toBe(
        expected,
      );
    },
  );

  it('returns null for RNA preset attachment point without component', () => {
    expect(
      getAttachmentPointTooltip('rnaPreset', AttachmentPointName.R1),
    ).toBeNull();
  });
});
