import {
  provideEditorInstance,
  withEditorInstance,
} from 'application/editor/editorSingleton';
import type { CoreEditor } from 'application/editor/Editor';
import type { Struct } from 'domain/entities';
import {
  FormatterFactory,
  SupportedFormat,
  identifyStructFormat,
} from './formatters';
import type { Ketcher } from './ketcher';
import type { StructService } from 'domain/services';
import { ChemicalMimeType } from 'domain/services/struct/structService.types';
import { EditorHistory } from './editor/internal';
import { KetSerializer } from 'domain/serializers';
import { assert } from 'utilities';

export async function prepareStructToRender(
  structStr: string,
  structService: StructService,
  ketcherInstance: Ketcher,
): Promise<Struct> {
  const struct: Struct = await parseStruct(
    structStr,
    structService,
    ketcherInstance,
  );
  struct.initHalfBonds();
  struct.initNeighbors();
  struct.setImplicitHydrogen();
  struct.setStereoLabelsToAtoms();
  struct.markFragments();

  return struct;
}

export function parseStruct(
  structStr: string,
  structService: StructService,
  ketcherInstance: Ketcher,
) {
  const format = identifyStructFormat(structStr);
  const factory = new FormatterFactory(structService);
  const options = ketcherInstance.editor.options();

  const service = factory.create(format, {
    'dearomatize-on-load': options['dearomatize-on-load'],
    ignoreChiralFlag: options.ignoreChiralFlag,
  });
  return service.getStructureFromStringAsync(structStr);
}

export function deleteAllEntitiesOnCanvas(targetEditor?: CoreEditor) {
  const editor = targetEditor ?? provideEditorInstance();
  return withEditorInstance(editor, () => {
    const modelChanges = editor.drawingEntitiesManager.deleteAllEntities();
    EditorHistory.getInstance(editor).update(modelChanges);
    editor.renderersContainer.update(modelChanges);
  });
}

export async function parseAndAddMacromoleculesOnCanvas(
  struct: string,
  structService: StructService,
  shouldMergeWithLatestHistoryCommand = false,
  inputFormat?: ChemicalMimeType,
  shouldReplaceCanvas = false,
  targetEditor?: CoreEditor,
) {
  const editor = targetEditor ?? provideEditorInstance();
  const ketSerializer = new KetSerializer();
  const format = identifyStructFormat(struct, true);
  let ketStruct = struct;
  if (format !== SupportedFormat.ket) {
    ketStruct = (
      await structService.convert({
        struct,
        output_format: ChemicalMimeType.KET,
        ...(inputFormat ? { input_format: inputFormat } : {}),
      })
    ).struct;
  }

  const deserialisedKet = ketSerializer.deserializeToDrawingEntities(ketStruct);
  assert(deserialisedKet);
  if (shouldReplaceCanvas) {
    deleteAllEntitiesOnCanvas(editor);
  }
  const isLongSequence = withEditorInstance(editor, () =>
    editor.ensureSequenceModeForLongSequence(
      deserialisedKet.drawingEntitiesManager.monomers.size,
    ),
  );
  withEditorInstance(editor, () => {
    const { command: modelChanges } =
      deserialisedKet.drawingEntitiesManager.mergeInto(
        editor.drawingEntitiesManager,
      );

    EditorHistory.getInstance(editor).update(
      modelChanges,
      shouldMergeWithLatestHistoryCommand,
    );
    editor.renderersContainer.update(modelChanges);
    if (isLongSequence) {
      editor.mode.initialize(false, false, false);
      editor.events.layoutModeChange.dispatch(editor.mode.modeName);
    }
  });
}
