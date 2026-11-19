import { vi } from 'vitest';
import { CoreEditor } from 'application/editor';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../helpers/dom';
import { coreEditorTheme, polymerEditorTheme } from '../../mock-data';
import { KetcherLogger, SettingsManager } from 'utilities';

// Separate file: CoreEditor caches the library after the first construction.
describe('CoreEditor stored monomer library updates', () => {
  const createChemTemplate = (name: string, modificationTypes: string[]) => ({
    root: {
      templates: [{ $ref: `monomerTemplate-${name}` }],
    },
    [`monomerTemplate-${name}`]: {
      type: 'monomerTemplate',
      id: name,
      class: 'CHEM',
      classHELM: 'CHEM',
      fullName: name,
      name,
      naturalAnalogShort: 'X',
      modificationTypes,
      props: {
        MonomerName: name,
        MonomerClass: 'CHEM',
        Name: name,
        MonomerNaturalAnalogCode: 'X',
      },
    },
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not crash on an invalid stored update and should still apply the remaining ones', async () => {
    const invalidStoredUpdate = JSON.stringify(
      createChemTemplate('STOREDBAD', ['Unknown monomer']),
    );
    const validStoredUpdate = JSON.stringify(
      createChemTemplate('STOREDGOOD', ['Natural amino acid']),
    );
    const emptyModificationTypesUpdate = JSON.stringify(
      createChemTemplate('STOREDEMPTY', []),
    );
    vi.spyOn(SettingsManager, 'monomerLibraryUpdates', 'get').mockReturnValue([
      invalidStoredUpdate,
      validStoredUpdate,
      emptyModificationTypesUpdate,
    ]);
    const errorSpy = vi
      .spyOn(KetcherLogger, 'error')
      .mockImplementation(() => undefined);

    let editor: CoreEditor | undefined;
    expect(() => {
      editor = new CoreEditor({
        canvas: createPolymerEditorCanvas(),
        theme: coreEditorTheme,
        renderersContainer: createRenderersManager(polymerEditorTheme),
      });
    }).not.toThrow();
    await editor?.ensureDefaultMonomersLibraryLoaded();

    const monomerNames = editor?.monomersLibrary.map(
      (monomer) => monomer.props?.MonomerName,
    );
    expect(monomerNames).toContain('STOREDGOOD');
    expect(monomerNames).toContain('STOREDEMPTY');
    expect(monomerNames).not.toContain('STOREDBAD');
    expect(errorSpy).toHaveBeenCalledWith(
      'Editor::updateMonomersLibrary',
      expect.stringContaining('STOREDBAD: '),
    );
  });
});
