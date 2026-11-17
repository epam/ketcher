// import { AssertionError } from 'assert';
// import { Editor } from 'application/editor';
// import { FormatterFactory } from 'application/formatters';
// import { Ketcher } from 'application/ketcher';
// import { StructService } from 'domain/services';
// import { mock } from 'jest-mock-extended';
import { Ketcher } from 'application/ketcher';
import type { StructService } from 'domain/services';
import type { CoreEditor } from 'application/editor/Editor';
import { ketcherProvider } from 'application/ketcherProvider';
import {
  setEditorInstance,
  resetEditorInstance,
} from 'application/editor/editorSingleton';
import { EditorHistory } from 'application/editor/EditorHistory';

let registeredKetcherId: string | undefined;

// skipped until cyclic reference is resolved
describe.skip('contructor()', () => {
  it('should throw exception when editor is null', () => {
    // const editor: Editor = null as unknown as Editor;
    // const structService: StructService = mock<StructService>();
    // const formatterFactory: FormatterFactory = mock<FormatterFactory>();
    //
    // expect(
    //   () => new Ketcher(editor, structService, formatterFactory),
    // ).toThrowError(AssertionError);
  });

  it('should throw exception when structService is null', () => {
    // const editor: Editor = mock<Editor>();
    // const structService: StructService = null as unknown as StructService;
    // const formatterFactory: FormatterFactory = mock<FormatterFactory>();
    //
    // expect(
    //   () => new Ketcher(editor, structService, formatterFactory),
    // ).toThrowError(AssertionError);
  });

  it('should throw exception when formatterFacory is null', () => {
    // const editor: Editor = mock<Editor>();
    // const structService: StructService = mock<StructService>();
    // const formatterFactory: FormatterFactory =
    //   null as unknown as FormatterFactory;
    //
    // expect(
    //   () => new Ketcher(editor, structService, formatterFactory),
    // ).toThrowError(AssertionError);
  });
});

describe('Ketcher.setMolecule', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    resetEditorInstance();
    if (registeredKetcherId) {
      ketcherProvider.removeKetcherInstance(registeredKetcherId);
      registeredKetcherId = undefined;
    }
    delete globalThis.isPolymerEditorTurnedOn;
  });

  it('preserves the current macromolecule canvas when conversion fails', async () => {
    const deleteAllEntities = jest.fn();
    const editor = {
      isSequenceEditInRNABuilderMode: false,
      isMacromoleculesMode: true,
      drawingEntitiesManager: { deleteAllEntities },
      renderersContainer: { update: jest.fn() },
    } as unknown as CoreEditor;
    setEditorInstance(editor);
    const conversionError = new Error('FASTA conversion failed');
    const structService = {
      convert: jest.fn().mockRejectedValue(conversionError),
    } as unknown as StructService;
    const ketcher = new Ketcher(structService, {} as never);
    registeredKetcherId = ketcher.id;
    ketcherProvider.addCoreEditorInstance(ketcher.id, editor);
    globalThis.isPolymerEditorTurnedOn = true;
    jest.spyOn(EditorHistory, 'getInstance').mockReturnValue({
      update: jest.fn(),
    } as unknown as EditorHistory);

    await ketcher.setMolecule('>sequence\nACGT');

    expect(structService.convert).toHaveBeenCalled();
    expect(deleteAllEntities).not.toHaveBeenCalled();
  });
});

describe('Ketcher mode APIs', () => {
  const registeredKetcherIds: string[] = [];

  afterEach(() => {
    jest.restoreAllMocks();
    resetEditorInstance();
    registeredKetcherIds.forEach((id) => {
      ketcherProvider.removeKetcherInstance(id);
    });
    registeredKetcherIds.length = 0;
  });

  it('routes mode changes to the CoreEditor owned by this Ketcher instance', () => {
    const createCoreEditor = (isLongSequence: boolean) => ({
      isLongSequence,
      events: {
        selectMode: { dispatch: jest.fn() },
        layoutModeChange: { dispatch: jest.fn() },
      },
      modeEvents: {
        switchToMacromoleculesMode: { dispatch: jest.fn() },
        switchToMoleculesMode: { dispatch: jest.fn() },
      },
    });
    const firstCoreEditor = createCoreEditor(false);
    const secondCoreEditor = createCoreEditor(true);
    const firstKetcher = new Ketcher({} as StructService, {} as never);
    const secondKetcher = new Ketcher({} as StructService, {} as never);
    registeredKetcherIds.push(firstKetcher.id, secondKetcher.id);
    ketcherProvider.addCoreEditorInstance(
      firstKetcher.id,
      firstCoreEditor as unknown as CoreEditor,
    );
    ketcherProvider.addCoreEditorInstance(
      secondKetcher.id,
      secondCoreEditor as unknown as CoreEditor,
    );

    setEditorInstance(secondCoreEditor as unknown as CoreEditor);

    firstKetcher.setMode('snake');
    firstKetcher.switchToMacromoleculesMode();
    firstKetcher.switchToMoleculesMode();

    expect(firstCoreEditor.events.selectMode.dispatch).toHaveBeenCalledWith(
      'snake-layout-mode',
    );
    expect(
      firstCoreEditor.events.layoutModeChange.dispatch,
    ).toHaveBeenCalledWith('snake-layout-mode');
    expect(
      firstCoreEditor.modeEvents.switchToMacromoleculesMode.dispatch,
    ).toHaveBeenCalledTimes(1);
    expect(
      firstCoreEditor.modeEvents.switchToMoleculesMode.dispatch,
    ).toHaveBeenCalledTimes(1);
    expect(secondCoreEditor.events.selectMode.dispatch).not.toHaveBeenCalled();
    expect(
      secondCoreEditor.events.layoutModeChange.dispatch,
    ).not.toHaveBeenCalled();
    expect(
      secondCoreEditor.modeEvents.switchToMacromoleculesMode.dispatch,
    ).not.toHaveBeenCalled();
    expect(
      secondCoreEditor.modeEvents.switchToMoleculesMode.dispatch,
    ).not.toHaveBeenCalled();
  });
});
