import type { CoreEditor } from 'application/editor';
import {
  resetEditorInstance,
  setEditorInstance,
} from 'application/editor/editorSingleton';
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
    resetEditorInstance();
  });

  it('treats matching library options as the same regardless of option order', () => {
    setEditorInstance({
      monomersLibrary: [createAmbiguousMonomerItem('library', ['B', 'A'])],
    } as CoreEditor);

    const monomer = new AmbiguousMonomer(
      createAmbiguousMonomerItem('current', ['A', 'B']),
      undefined,
      false,
    );

    expect(monomer.isModification).toBe(false);
  });
});
