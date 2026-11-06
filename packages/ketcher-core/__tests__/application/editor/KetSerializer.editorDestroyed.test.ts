import { CoreEditor } from 'application/editor';
import { KetSerializer } from 'domain/serializers';
import { monomerFactory } from 'application/render/renderers/monomerFactory';
import { SettingsManager } from 'utilities';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../helpers/dom';
import { coreEditorTheme, polymerEditorTheme } from '../../mock-data';
import {
  SPACER_TEMPLATE_ID,
  createMacromoleculesKet,
  deserializeToManager,
  findMonomerByLabel,
  spacerTemplate,
} from '../../domain/serializers/ket/fixtures/macromolecules';

// Separate file: CoreEditor caches the library after the first construction,
// and the editor singleton is module-level state.
describe('KetSerializer reads after the editor is destroyed', () => {
  let editor: CoreEditor;
  const serializer = new KetSerializer();

  const deserializeSpacer = (ket: Record<string, unknown>) =>
    findMonomerByLabel(
      deserializeToManager(serializer, JSON.stringify(ket)),
      'Sp',
    );

  beforeAll(() => {
    KetSerializer.setMonomerFactory(monomerFactory);
    jest
      .spyOn(SettingsManager, 'monomerLibraryUpdates', 'get')
      .mockReturnValue([]);
    editor = new CoreEditor({
      canvas: createPolymerEditorCanvas(),
      theme: coreEditorTheme,
      renderersContainer: createRenderersManager(polymerEditorTheme),
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('reads a KET without enrichment and without throwing', () => {
    editor.updateMonomersLibrary(
      JSON.stringify({
        root: {
          templates: [{ $ref: `monomerTemplate-${SPACER_TEMPLATE_ID}` }],
        },
        [`monomerTemplate-${SPACER_TEMPLATE_ID}`]: {
          ...spacerTemplate,
          idtAliases: { base: 'iSpBase' },
        },
      }),
    );
    expect(
      deserializeSpacer(createMacromoleculesKet()).monomerItem.props.idtAliases,
    ).toEqual({ base: 'iSpBase' });

    editor.destroy();

    let spacer: BaseMonomer | undefined;

    expect(() => {
      spacer = deserializeSpacer(createMacromoleculesKet());
    }).not.toThrow();
    expect(spacer?.monomerItem.props.idtAliases).toBeUndefined();
    expect(spacer?.monomerItem.props.modificationTypes).toBeUndefined();
  });
});
