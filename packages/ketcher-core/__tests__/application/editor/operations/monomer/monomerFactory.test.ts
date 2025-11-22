import { monomerFactory } from 'application/editor/operations/monomer/monomerFactory';
import { KetMonomerClass } from 'application/formatters/types/ket';
import { MonomerItemType } from 'domain/types';
import { Struct } from 'domain/entities';

describe('monomerFactory', () => {
  const createMonomerItem = (
    MonomerClass: KetMonomerClass,
    unresolved = false,
  ): MonomerItemType => ({
    label: 'TestMonomer',
    struct: new Struct(),
    props: {
      MonomerNaturalAnalogCode: 'T',
      MonomerName: 'TestMonomer',
      Name: 'TestMonomer',
      MonomerClass,
      unresolved,
    },
  });

  describe('unresolved monomers', () => {
    it('should preserve Sugar MonomerClass for unresolved sugar monomers', () => {
      const monomer = createMonomerItem(KetMonomerClass.Sugar, true);
      const [, , ketMonomerClass] = monomerFactory(monomer);
      expect(ketMonomerClass).toBe(KetMonomerClass.Sugar);
    });

    it('should preserve Base MonomerClass for unresolved base monomers', () => {
      const monomer = createMonomerItem(KetMonomerClass.Base, true);
      const [, , ketMonomerClass] = monomerFactory(monomer);
      expect(ketMonomerClass).toBe(KetMonomerClass.Base);
    });

    it('should preserve Phosphate MonomerClass for unresolved phosphate monomers', () => {
      const monomer = createMonomerItem(KetMonomerClass.Phosphate, true);
      const [, , ketMonomerClass] = monomerFactory(monomer);
      expect(ketMonomerClass).toBe(KetMonomerClass.Phosphate);
    });

    it('should preserve AminoAcid MonomerClass for unresolved amino acid monomers', () => {
      const monomer = createMonomerItem(KetMonomerClass.AminoAcid, true);
      const [, , ketMonomerClass] = monomerFactory(monomer);
      expect(ketMonomerClass).toBe(KetMonomerClass.AminoAcid);
    });

    it('should default to CHEM MonomerClass for unresolved monomers without MonomerClass', () => {
      const monomer: MonomerItemType = {
        label: 'TestMonomer',
        struct: new Struct(),
        props: {
          MonomerNaturalAnalogCode: 'T',
          MonomerName: 'TestMonomer',
          Name: 'TestMonomer',
          unresolved: true,
        },
      };
      const [, , ketMonomerClass] = monomerFactory(monomer);
      expect(ketMonomerClass).toBe(KetMonomerClass.CHEM);
    });
  });

  describe('resolved monomers', () => {
    it('should return Sugar MonomerClass for resolved sugar monomers', () => {
      const monomer = createMonomerItem(KetMonomerClass.Sugar, false);
      const [, , ketMonomerClass] = monomerFactory(monomer);
      expect(ketMonomerClass).toBe(KetMonomerClass.Sugar);
    });

    it('should return Base MonomerClass for resolved base monomers', () => {
      const monomer = createMonomerItem(KetMonomerClass.Base, false);
      const [, , ketMonomerClass] = monomerFactory(monomer);
      expect(ketMonomerClass).toBe(KetMonomerClass.Base);
    });

    it('should return Phosphate MonomerClass for resolved phosphate monomers', () => {
      const monomer = createMonomerItem(KetMonomerClass.Phosphate, false);
      const [, , ketMonomerClass] = monomerFactory(monomer);
      expect(ketMonomerClass).toBe(KetMonomerClass.Phosphate);
    });

    it('should return AminoAcid MonomerClass for resolved amino acid monomers', () => {
      const monomer = createMonomerItem(KetMonomerClass.AminoAcid, false);
      const [, , ketMonomerClass] = monomerFactory(monomer);
      expect(ketMonomerClass).toBe(KetMonomerClass.AminoAcid);
    });
  });
});
