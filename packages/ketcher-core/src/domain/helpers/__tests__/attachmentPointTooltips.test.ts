import { getAttachmentPointTooltip } from '../attachmentPointTooltips';
import { AttachmentPointName } from 'domain/types';
import { KetMonomerClass } from 'application/formatters/types/ket';

describe('getAttachmentPointTooltip', () => {
  describe('for Sugar monomer class', () => {
    it("should return 5' for R1", () => {
      expect(
        getAttachmentPointTooltip(
          KetMonomerClass.Sugar,
          AttachmentPointName.R1,
        ),
      ).toBe("5'");
    });

    it("should return 3' for R2", () => {
      expect(
        getAttachmentPointTooltip(
          KetMonomerClass.Sugar,
          AttachmentPointName.R2,
        ),
      ).toBe("3'");
    });

    it('should return null for R3', () => {
      expect(
        getAttachmentPointTooltip(
          KetMonomerClass.Sugar,
          AttachmentPointName.R3,
        ),
      ).toBeNull();
    });
  });

  describe('for Phosphate monomer class', () => {
    it("should return 5' for R1", () => {
      expect(
        getAttachmentPointTooltip(
          KetMonomerClass.Phosphate,
          AttachmentPointName.R1,
        ),
      ).toBe("5'");
    });

    it("should return 3' for R2", () => {
      expect(
        getAttachmentPointTooltip(
          KetMonomerClass.Phosphate,
          AttachmentPointName.R2,
        ),
      ).toBe("3'");
    });
  });

  describe('for RNA monomer class', () => {
    it("should return 5' for R1", () => {
      expect(
        getAttachmentPointTooltip(KetMonomerClass.RNA, AttachmentPointName.R1),
      ).toBe("5'");
    });

    it("should return 3' for R2", () => {
      expect(
        getAttachmentPointTooltip(KetMonomerClass.RNA, AttachmentPointName.R2),
      ).toBe("3'");
    });
  });

  describe('for non-target monomer classes', () => {
    it('should return null for AminoAcid', () => {
      expect(
        getAttachmentPointTooltip(
          KetMonomerClass.AminoAcid,
          AttachmentPointName.R1,
        ),
      ).toBeNull();
    });

    it('should return null for Base', () => {
      expect(
        getAttachmentPointTooltip(KetMonomerClass.Base, AttachmentPointName.R1),
      ).toBeNull();
    });

    it('should return null for CHEM', () => {
      expect(
        getAttachmentPointTooltip(KetMonomerClass.CHEM, AttachmentPointName.R1),
      ).toBeNull();
    });

    it('should return null for undefined monomer class', () => {
      expect(
        getAttachmentPointTooltip(undefined, AttachmentPointName.R1),
      ).toBeNull();
    });
  });

  describe('for rnaPreset type with component context', () => {
    it("should return 5' for R1 of sugar component", () => {
      expect(
        getAttachmentPointTooltip('rnaPreset', AttachmentPointName.R1, 'sugar'),
      ).toBe("5'");
    });

    it('should return null for R2 of sugar component', () => {
      expect(
        getAttachmentPointTooltip('rnaPreset', AttachmentPointName.R2, 'sugar'),
      ).toBeNull();
    });

    it("should return 3' for R2 of phosphate component", () => {
      expect(
        getAttachmentPointTooltip(
          'rnaPreset',
          AttachmentPointName.R2,
          'phosphate',
        ),
      ).toBe("3'");
    });

    it('should return null for R1 of phosphate component', () => {
      expect(
        getAttachmentPointTooltip(
          'rnaPreset',
          AttachmentPointName.R1,
          'phosphate',
        ),
      ).toBeNull();
    });

    it('should return null for base component', () => {
      expect(
        getAttachmentPointTooltip('rnaPreset', AttachmentPointName.R1, 'base'),
      ).toBeNull();
    });

    it('should return null for rnaPreset without component type', () => {
      expect(
        getAttachmentPointTooltip('rnaPreset', AttachmentPointName.R1),
      ).toBeNull();
    });
  });
});
