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
import {
  AmbiguousMonomer,
  BaseMonomer,
  KetAmbiguousMonomerTemplateSubType,
  KetMonomerClass,
  RNABase,
} from 'ketcher-core';
import { isSenseBase, isAntisenseCreationDisabled } from './helpers';

describe('SelectedMonomersContextMenu helpers', () => {
  describe('isSenseBase', () => {
    it('should return true for natural RNA/DNA bases', () => {
      const baseA = {
        monomerItem: {
          props: { MonomerNaturalAnalogCode: 'A' },
          isAmbiguous: false,
        },
      } as unknown as RNABase;

      expect(isSenseBase(baseA)).toBe(true);
    });

    it('should return false for non-ambiguous non-natural bases', () => {
      const modifiedBase = {
        monomerItem: {
          props: { MonomerNaturalAnalogCode: 'X' },
          isAmbiguous: false,
        },
      } as unknown as RNABase;

      expect(isSenseBase(modifiedBase)).toBe(false);
    });

    it('should return false for ambiguous peptide monomers', () => {
      const ambiguousPeptide = {
        monomerItem: {
          props: { MonomerNaturalAnalogCode: '' },
          isAmbiguous: true,
        },
        monomerClass: KetMonomerClass.AminoAcid,
        subtype: KetAmbiguousMonomerTemplateSubType.ALTERNATIVES,
        monomers: [],
      } as unknown as AmbiguousMonomer;

      // Should not throw an error and return false
      expect(isSenseBase(ambiguousPeptide)).toBe(false);
    });

    it('should handle ambiguous RNA bases with undefined monomers array', () => {
      const ambiguousBase = {
        monomerItem: {
          props: { MonomerNaturalAnalogCode: '' },
          isAmbiguous: true,
        },
        monomerClass: KetMonomerClass.Base,
        subtype: KetAmbiguousMonomerTemplateSubType.ALTERNATIVES,
        monomers: undefined,
      } as unknown as AmbiguousMonomer;

      // Should not throw an error and return false
      expect(isSenseBase(ambiguousBase)).toBe(false);
    });

    it('should handle ambiguous RNA bases with empty monomers array', () => {
      const ambiguousBase = {
        monomerItem: {
          props: { MonomerNaturalAnalogCode: '' },
          isAmbiguous: true,
        },
        monomerClass: KetMonomerClass.Base,
        subtype: KetAmbiguousMonomerTemplateSubType.ALTERNATIVES,
        monomers: [],
      } as unknown as AmbiguousMonomer;

      // Should not throw an error and return false
      expect(isSenseBase(ambiguousBase)).toBe(false);
    });

    it('should return false for mixture type ambiguous monomers', () => {
      const mixtureMonomer = {
        monomerItem: {
          props: { MonomerNaturalAnalogCode: '' },
          isAmbiguous: true,
        },
        monomerClass: KetMonomerClass.Base,
        subtype: KetAmbiguousMonomerTemplateSubType.MIXTURE,
        monomers: [],
      } as unknown as AmbiguousMonomer;

      expect(isSenseBase(mixtureMonomer)).toBe(false);
    });
  });

  describe('isAntisenseCreationDisabled', () => {
    it('should not throw error when ambiguous peptide is in selection', () => {
      const rnaBase = {
        monomerItem: {
          props: { MonomerNaturalAnalogCode: 'A' },
          isAmbiguous: false,
        },
        hydrogenBonds: [],
        covalentBonds: [],
      } as unknown as RNABase;

      const ambiguousPeptide = {
        monomerItem: {
          props: { MonomerNaturalAnalogCode: '' },
          isAmbiguous: true,
        },
        monomerClass: KetMonomerClass.AminoAcid,
        subtype: KetAmbiguousMonomerTemplateSubType.ALTERNATIVES,
        monomers: [],
      } as unknown as AmbiguousMonomer;

      const selectedMonomers = [rnaBase, ambiguousPeptide] as BaseMonomer[];

      // Should not throw an error
      expect(() => isAntisenseCreationDisabled(selectedMonomers)).not.toThrow();
      expect(isAntisenseCreationDisabled(selectedMonomers)).toBe(false);
    });
  });
});
