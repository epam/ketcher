import {
  KetAmbiguousMonomerTemplateSubType,
  KetMonomerClass,
} from 'application/formatters/types/ket';
import { AmbiguousMonomer } from 'domain/entities/AmbiguousMonomer';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import type { AmbiguousMonomerType, MonomerItemType } from 'domain/types';

const createMonomer = (label: string) =>
  ({
    monomerItem: {
      label,
      struct: {} as MonomerItemType['struct'],
      props: {
        MonomerName: label,
        Name: label,
        MonomerNaturalAnalogCode: label,
        MonomerClass: KetMonomerClass.AminoAcid,
      },
    },
    listOfAttachmentPoints: [],
  }) as unknown as BaseMonomer;

const createAmbiguousMonomerItem = (
  id: string,
  templateIds: string[],
): AmbiguousMonomerType => ({
  label: id,
  id,
  isAmbiguous: true,
  subtype: KetAmbiguousMonomerTemplateSubType.ALTERNATIVES,
  options: templateIds.map((templateId) => ({ templateId })),
  monomers: templateIds.map(createMonomer),
});

describe('AmbiguousMonomer.isModification', () => {
  afterEach(() => {
    AmbiguousMonomer.setMonomersLibrarySource(undefined);
  });

  it('treats matching library options as the same regardless of option order', () => {
    AmbiguousMonomer.setMonomersLibrarySource({
      monomersLibrary: [createAmbiguousMonomerItem('library', ['B', 'A'])],
    });

    const monomer = new AmbiguousMonomer(
      createAmbiguousMonomerItem('current', ['A', 'B']),
      undefined,
      false,
    );

    expect(monomer.isModification).toBe(false);
  });
});
