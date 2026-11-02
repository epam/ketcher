import { CoreEditor } from 'application/editor';
import {
  KetAmbiguousMonomerTemplateSubType,
  KetMonomerClass,
} from 'application/formatters/types/ket';
import { AmbiguousMonomer } from 'domain/entities/AmbiguousMonomer';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import type { AmbiguousMonomerType, MonomerItemType } from 'domain/types';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../helpers/dom';
import { coreEditorTheme, polymerEditorTheme } from '../../mock-data';

// Separate file: CoreEditor caches the library after the first construction.
// The editor offers no call that adds an ambiguous template to
// `monomersLibrary` (updateMonomersLibrary handles monomer templates only), so
// the tests add one to the array that the `monomersLibrary` getter returns.
describe('AmbiguousMonomer.isModification through a CoreEditor library', () => {
  let canvas: SVGSVGElement;
  let editor: CoreEditor;
  let isEditorDestroyed: boolean;
  let addedLibraryItems: AmbiguousMonomerType[];

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
    subtype = KetAmbiguousMonomerTemplateSubType.ALTERNATIVES,
  ): AmbiguousMonomerType => ({
    label: id,
    id,
    isAmbiguous: true,
    subtype,
    options: templateIds.map((templateId) => ({ templateId })),
    monomers: templateIds.map(createMonomer),
  });

  // The library array is typed for monomers, though it also holds ambiguous items.
  const addToLibrary = (item: AmbiguousMonomerType) => {
    editor.monomersLibrary.push(item as unknown as MonomerItemType);
    addedLibraryItems.push(item);
  };

  const createVariantMonomer = (
    templateIds: string[],
    subtype = KetAmbiguousMonomerTemplateSubType.ALTERNATIVES,
  ) =>
    new AmbiguousMonomer(
      createAmbiguousMonomerItem('variant', templateIds, subtype),
      undefined,
      false,
    );

  beforeEach(() => {
    canvas = createPolymerEditorCanvas();
    editor = new CoreEditor({
      canvas,
      theme: coreEditorTheme,
      renderersContainer: createRenderersManager(polymerEditorTheme),
    });
    isEditorDestroyed = false;
    addedLibraryItems = [];
  });

  afterEach(() => {
    addedLibraryItems.forEach((item) => {
      const index = editor.monomersLibrary.indexOf(
        item as unknown as MonomerItemType,
      );

      if (index !== -1) {
        editor.monomersLibrary.splice(index, 1);
      }
    });
    if (!isEditorDestroyed) {
      editor.destroy();
    }
    canvas.remove();
  });

  it.each([
    ['same order', ['PIN_A', 'PIN_B']],
    ['reverse order', ['PIN_B', 'PIN_A']],
  ])(
    'is false when the library holds an ambiguous item with the same options, %s',
    (_name, variantOptions) => {
      addToLibrary(createAmbiguousMonomerItem('library', ['PIN_A', 'PIN_B']));

      expect(createVariantMonomer(variantOptions).isModification).toBe(false);
    },
  );

  it('is true when no library ambiguous item has the same options', () => {
    addToLibrary(createAmbiguousMonomerItem('library', ['PIN_A', 'PIN_B']));

    expect(createVariantMonomer(['PIN_A', 'PIN_C']).isModification).toBe(true);
    expect(createVariantMonomer(['PIN_A']).isModification).toBe(true);
    expect(
      createVariantMonomer(['PIN_A', 'PIN_B', 'PIN_C']).isModification,
    ).toBe(true);
  });

  it('is true when the options match but the subtype differs', () => {
    addToLibrary(createAmbiguousMonomerItem('library', ['PIN_A', 'PIN_B']));

    expect(
      createVariantMonomer(
        ['PIN_A', 'PIN_B'],
        KetAmbiguousMonomerTemplateSubType.MIXTURE,
      ).isModification,
    ).toBe(true);
  });

  it('turns false on the same monomer once the library gains a matching ambiguous item', () => {
    const variantMonomer = createVariantMonomer(['PIN_A', 'PIN_C']);

    expect(variantMonomer.isModification).toBe(true);

    addToLibrary(createAmbiguousMonomerItem('library', ['PIN_C', 'PIN_A']));

    expect(variantMonomer.isModification).toBe(false);
  });

  it('is true after the editor is destroyed', () => {
    addToLibrary(createAmbiguousMonomerItem('library', ['PIN_A', 'PIN_B']));
    const variantMonomer = createVariantMonomer(['PIN_A', 'PIN_B']);

    expect(variantMonomer.isModification).toBe(false);

    editor.destroy();
    isEditorDestroyed = true;

    expect(variantMonomer.isModification).toBe(true);
  });
});
