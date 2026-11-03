import { CoreEditor } from 'application/editor';
import { KetSerializer } from 'domain/serializers';
import { monomerFactory } from 'application/render/renderers/monomerFactory';
import { SettingsManager } from 'utilities';
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

const PARSING_ERROR = 'Error during file parsing';

// Separate file: CoreEditor caches the library after the first construction,
// and the editor singleton is module-level state.
describe('KetSerializer reads that depend on the editor', () => {
  let editor: CoreEditor;
  const serializer = new KetSerializer();

  const libraryTemplate = (fields: Record<string, unknown>) =>
    JSON.stringify({
      root: { templates: [{ $ref: `monomerTemplate-${SPACER_TEMPLATE_ID}` }] },
      [`monomerTemplate-${SPACER_TEMPLATE_ID}`]: {
        ...spacerTemplate,
        ...fields,
      },
    });

  const deserializeMonomer = (ket: Record<string, unknown>, label: string) =>
    findMonomerByLabel(
      deserializeToManager(serializer, JSON.stringify(ket)),
      label,
    );
  const deserializeSpacer = (ket: Record<string, unknown>) =>
    deserializeMonomer(ket, 'Sp');
  const loadSpacerIntoLibrary = (fields: Record<string, unknown>) =>
    editor.updateMonomersLibrary(libraryTemplate(fields));

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

  beforeEach(() => {
    editor.clearMonomersLibrary();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('library enrichment of monomer templates', () => {
    it('leaves a template as it is when the library has no template with that id', () => {
      const spacer = deserializeSpacer(createMacromoleculesKet());

      expect(spacer.monomerItem.props.idtAliases).toBeUndefined();
      expect(spacer.monomerItem.props.modificationTypes).toBeUndefined();
    });

    it('fills idtAliases and modificationTypes from the live library template with the same id', () => {
      loadSpacerIntoLibrary({
        idtAliases: { base: 'iSpBase' },
        modificationTypes: ['Natural amino acid'],
      });

      const ket = createMacromoleculesKet();
      const spacer = deserializeSpacer(ket);

      expect(spacer.monomerItem.props.idtAliases).toEqual({ base: 'iSpBase' });
      expect(spacer.monomerItem.props.modificationTypes).toEqual([
        'Natural amino acid',
      ]);
      expect(
        deserializeMonomer(ket, 'A').monomerItem.props.idtAliases,
      ).toBeUndefined();
    });

    it('keeps the values that the KET template carries itself', () => {
      loadSpacerIntoLibrary({
        idtAliases: { base: 'fromLibrary' },
        modificationTypes: ['Library type'],
      });

      const ket = createMacromoleculesKet();

      ket[`monomerTemplate-${SPACER_TEMPLATE_ID}`].modificationTypes = [
        'Natural amino acid',
      ];
      ket[`monomerTemplate-${SPACER_TEMPLATE_ID}`].idtAliases = {
        base: 'fromKet',
      };

      const spacer = deserializeSpacer(ket);

      expect(spacer.monomerItem.props.idtAliases).toEqual({ base: 'fromKet' });
      expect(spacer.monomerItem.props.modificationTypes).toEqual([
        'Natural amino acid',
      ]);
    });
  });

  describe('parsing errors', () => {
    it('reports a monomer node whose template is missing and returns no result', () => {
      const dispatch = jest.spyOn(editor.events.error, 'dispatch');
      const ket = createMacromoleculesKet();

      delete ket[`monomerTemplate-${SPACER_TEMPLATE_ID}`];

      expect(
        serializer.deserializeToDrawingEntities(JSON.stringify(ket)),
      ).toBeUndefined();
      expect(dispatch).toHaveBeenCalledWith(PARSING_ERROR);
    });

    it('reports a connection of an unsupported type and skips that connection', () => {
      const dispatch = jest.spyOn(editor.events.error, 'dispatch');
      const ket = createMacromoleculesKet();

      ket.root.connections[0].connectionType = 'unsupported';

      const result = serializer.deserializeToDrawingEntities(
        JSON.stringify(ket),
      );

      expect(dispatch).toHaveBeenCalledWith(PARSING_ERROR);
      // The monomers are read; of the four polymer bonds the unsupported one
      // (monomer0 - monomer1) is not created.
      expect(result?.drawingEntitiesManager.monomers.size).toBe(5);
      expect(result?.drawingEntitiesManager.polymerBonds.size).toBe(3);
    });

    it('does not report anything for a valid KET', () => {
      const dispatch = jest.spyOn(editor.events.error, 'dispatch');

      serializer.deserializeToDrawingEntities(
        JSON.stringify(createMacromoleculesKet()),
      );

      expect(dispatch).not.toHaveBeenCalled();
    });
  });
});
