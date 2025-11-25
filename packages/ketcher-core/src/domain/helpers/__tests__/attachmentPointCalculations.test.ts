import { isSingleRGroupAttachmentPoint } from '../attachmentPointCalculations';

// Helper function to convert R-group numbers to binary representation
function toRlabel(values: number[]): number {
  let res = 0;
  values.forEach((val) => {
    const rgi = val - 1;
    res |= 1 << rgi;
  });
  return res;
}

describe('isSingleRGroupAttachmentPoint', () => {
  describe('single R-group labels', () => {
    it('should return true for R1 (rglabel=1)', () => {
      expect(isSingleRGroupAttachmentPoint(toRlabel([1]))).toBe(true);
    });

    it('should return true for R2 (rglabel=2)', () => {
      expect(isSingleRGroupAttachmentPoint(toRlabel([2]))).toBe(true);
    });

    it('should return true for R3 (rglabel=4)', () => {
      expect(isSingleRGroupAttachmentPoint(toRlabel([3]))).toBe(true);
    });

    it('should return true for R4 (rglabel=8)', () => {
      expect(isSingleRGroupAttachmentPoint(toRlabel([4]))).toBe(true);
    });

    it('should return true for R5 (rglabel=16)', () => {
      expect(isSingleRGroupAttachmentPoint(toRlabel([5]))).toBe(true);
    });

    it('should return true for R6 (rglabel=32)', () => {
      expect(isSingleRGroupAttachmentPoint(toRlabel([6]))).toBe(true);
    });

    it('should return true for R7 (rglabel=64)', () => {
      expect(isSingleRGroupAttachmentPoint(toRlabel([7]))).toBe(true);
    });

    it('should return true for R8 (rglabel=128)', () => {
      expect(isSingleRGroupAttachmentPoint(toRlabel([8]))).toBe(true);
    });

    it('should return true for R16 (rglabel=32768)', () => {
      expect(isSingleRGroupAttachmentPoint(toRlabel([16]))).toBe(true);
    });

    it('should return true for R31 (rglabel=1073741824)', () => {
      expect(isSingleRGroupAttachmentPoint(toRlabel([31]))).toBe(true);
    });

    // This is the key test case for the bug fix
    it('should return true for R32 (rglabel=-2147483648)', () => {
      const rglabel = toRlabel([32]);
      expect(rglabel).toBe(-2147483648); // Verify the negative value
      expect(isSingleRGroupAttachmentPoint(rglabel)).toBe(true);
    });
  });

  describe('multiple R-group labels', () => {
    it('should return false for R1+R2 (rglabel=3)', () => {
      expect(isSingleRGroupAttachmentPoint(toRlabel([1, 2]))).toBe(false);
    });

    it('should return false for R1+R3 (rglabel=5)', () => {
      expect(isSingleRGroupAttachmentPoint(toRlabel([1, 3]))).toBe(false);
    });

    it('should return false for R2+R3 (rglabel=6)', () => {
      expect(isSingleRGroupAttachmentPoint(toRlabel([2, 3]))).toBe(false);
    });

    it('should return false for R1+R2+R3 (rglabel=7)', () => {
      expect(isSingleRGroupAttachmentPoint(toRlabel([1, 2, 3]))).toBe(false);
    });

    it('should return false for R1+R32 (rglabel=-2147483647)', () => {
      expect(isSingleRGroupAttachmentPoint(toRlabel([1, 32]))).toBe(false);
    });

    it('should return false for R6+R32 (rglabel=-2147483616)', () => {
      expect(isSingleRGroupAttachmentPoint(toRlabel([6, 32]))).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should return false for 0', () => {
      expect(isSingleRGroupAttachmentPoint(0)).toBe(false);
    });

    it('should return false for negative numbers that are not powers of 2', () => {
      expect(isSingleRGroupAttachmentPoint(-1)).toBe(false);
      expect(isSingleRGroupAttachmentPoint(-3)).toBe(false);
    });
  });
});
