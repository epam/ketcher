import { KetMonomerClass } from 'application/formatters/types/ket';
import { AmbiguousMonomer } from 'domain/entities/AmbiguousMonomer';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import type { MonomerItemType } from 'domain/types';

const createMonomer = (label: string, monomerClass: KetMonomerClass) =>
  ({
    monomerItem: {
      label,
      struct: {} as MonomerItemType['struct'],
      props: {
        MonomerName: label,
        Name: label,
        MonomerNaturalAnalogCode: label,
        MonomerClass: monomerClass,
      },
    },
    listOfAttachmentPoints: [],
  }) as unknown as BaseMonomer;

// resolveMonomerClass maps a monomer whose MonomerClass is AminoAcid, Sugar,
// Phosphate, Base or CHEM to that class. getMonomerClass gives that class when
// every option resolves to it, and CHEM when the options resolve to different
// classes.
describe('AmbiguousMonomer.getMonomerClass', () => {
  it.each([
    KetMonomerClass.Base,
    KetMonomerClass.Sugar,
    KetMonomerClass.Phosphate,
    KetMonomerClass.AminoAcid,
    KetMonomerClass.CHEM,
  ])('keeps the class of options that all are %s', (monomerClass) => {
    const monomers = [
      createMonomer('A', monomerClass),
      createMonomer('B', monomerClass),
      createMonomer('C', monomerClass),
    ];

    expect(AmbiguousMonomer.getMonomerClass(monomers)).toBe(monomerClass);
  });

  it('gives that class for a single option', () => {
    expect(
      AmbiguousMonomer.getMonomerClass([
        createMonomer('A', KetMonomerClass.Sugar),
      ]),
    ).toBe(KetMonomerClass.Sugar);
  });

  it.each([
    [KetMonomerClass.Base, KetMonomerClass.Sugar],
    [KetMonomerClass.Sugar, KetMonomerClass.Base],
    [KetMonomerClass.Base, KetMonomerClass.AminoAcid],
    [KetMonomerClass.Phosphate, KetMonomerClass.Sugar],
  ])('gives CHEM for options of mixed classes %s and %s', (first, second) => {
    const monomers = [
      createMonomer('A', first),
      createMonomer('B', first),
      createMonomer('C', second),
    ];

    expect(AmbiguousMonomer.getMonomerClass(monomers)).toBe(
      KetMonomerClass.CHEM,
    );
  });
});
