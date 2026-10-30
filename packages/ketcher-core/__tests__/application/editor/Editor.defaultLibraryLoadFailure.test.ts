import { CoreEditor } from 'application/editor';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../helpers/dom';
import { coreEditorTheme, polymerEditorTheme } from '../../mock-data';
import { KetcherLogger, SettingsManager } from 'utilities';

jest.mock('application/editor/data/monomers.ket', () => {
  throw new Error('Failed to fetch dynamically imported module');
});

// Separate file: CoreEditor caches the library after the first construction.
describe('CoreEditor when the default monomers library fails to load', () => {
  const storedUpdate = JSON.stringify({
    root: {
      templates: [{ $ref: 'monomerTemplate-STOREDGOOD' }],
    },
    'monomerTemplate-STOREDGOOD': {
      type: 'monomerTemplate',
      id: 'STOREDGOOD',
      class: 'CHEM',
      classHELM: 'CHEM',
      fullName: 'STOREDGOOD',
      name: 'STOREDGOOD',
      naturalAnalogShort: 'X',
      modificationTypes: ['Natural amino acid'],
      props: {
        MonomerName: 'STOREDGOOD',
        MonomerClass: 'CHEM',
        Name: 'STOREDGOOD',
        MonomerNaturalAnalogCode: 'X',
      },
    },
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should still apply monomers persisted in localStorage', async () => {
    jest
      .spyOn(SettingsManager, 'monomerLibraryUpdates', 'get')
      .mockReturnValue([storedUpdate]);
    jest.spyOn(KetcherLogger, 'error').mockImplementation();

    const editor = new CoreEditor({
      canvas: createPolymerEditorCanvas(),
      theme: coreEditorTheme,
      renderersContainer: createRenderersManager(polymerEditorTheme),
    });
    const openErrorModalSpy = jest.fn();
    editor.events.openErrorModal.add(openErrorModalSpy);

    await editor.ensureDefaultMonomersLibraryLoaded();

    expect(openErrorModalSpy).toHaveBeenCalledWith(
      expect.objectContaining({ errorTitle: 'Monomer library load failed' }),
    );
    expect(editor.monomersLibrary.map((m) => m.props?.MonomerName)).toEqual([
      'STOREDGOOD',
    ]);
  });
});
