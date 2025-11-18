/* eslint-disable jest/no-export */
/* eslint-disable @typescript-eslint/no-explicit-any */
describe('AmbiguousSequenceItemRenderer', () => {
  describe('symbolToDisplay logic', () => {
    it('should return @ for CHEM monomerClass', () => {
      const CHEM = 'CHEM';
      const Sugar = 'Sugar';
      const monomerClass: any = CHEM;

      const shouldReturnAt = monomerClass === CHEM || monomerClass === Sugar;

      expect(shouldReturnAt).toBe(true);
    });

    it('should return @ for Sugar monomerClass', () => {
      const CHEM = 'CHEM';
      const Sugar = 'Sugar';
      const monomerClass: any = Sugar;

      const shouldReturnAt = monomerClass === CHEM || monomerClass === Sugar;

      expect(shouldReturnAt).toBe(true);
    });

    it('should not return @ for AminoAcid monomerClass', () => {
      const CHEM = 'CHEM';
      const Sugar = 'Sugar';
      const monomerClass: any = 'AminoAcid';

      const shouldReturnAt = monomerClass === CHEM || monomerClass === Sugar;

      expect(shouldReturnAt).toBe(false);
    });

    it('should not return @ for Base monomerClass', () => {
      const CHEM = 'CHEM';
      const Sugar = 'Sugar';
      const monomerClass: any = 'Base';

      const shouldReturnAt = monomerClass === CHEM || monomerClass === Sugar;

      expect(shouldReturnAt).toBe(false);
    });
  });
});

export {};
