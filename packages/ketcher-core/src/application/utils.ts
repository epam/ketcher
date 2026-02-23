import { Struct } from 'domain/entities/struct';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import type { FormatterFactory } from './formatters/formatterFactory';
import { SupportedFormat } from './formatters/structFormatter.types';
import { Ketcher } from './ketcher';
import { ketcherProvider } from './ketcherProvider';
import { ChemicalMimeType, StructService } from 'domain/services';
import assert from 'assert';
import { EditorSelection } from './editor/editor.types';
import type { CoreEditor } from './editor/internal';

const getCoreEditorInstance = () => {
  const { CoreEditor } = require('./editor/internal');
  return CoreEditor.provideEditorInstance();
};

const updateEditorHistory = (
  editor: CoreEditor,
  modelChanges: unknown,
  mergeWithLatestHistoryCommand = false,
): void => {
  const { EditorHistory } = require('./editor/internal');
  new EditorHistory(editor).update(modelChanges, mergeWithLatestHistoryCommand);
};

const identifyStructFormat = (structStr: string) => {
  const { identifyStructFormat } = require('./formatters/identifyStructFormat');
  return identifyStructFormat(structStr);
};

const createFormatterFactory = (
  structService: StructService,
): FormatterFactory => {
  const { FormatterFactory } = require('./formatters/formatterFactory');
  return new FormatterFactory(structService);
};

export { ketcherProvider };

export function getStructure(
  ketcherId: string,
  formatterFactory: FormatterFactory,
  struct: Struct,
  structureFormat = SupportedFormat.rxn,
  drawingEntitiesManager?: DrawingEntitiesManager,
  selection?: EditorSelection,
): Promise<string> {
  const serverSettings =
    ketcherProvider.getKetcher(ketcherId).editor.serverSettings;
  const formatter = formatterFactory.create(structureFormat, serverSettings);
  const drawingEntitiesManagerCloningResult = drawingEntitiesManager?.mergeInto(
    new DrawingEntitiesManager(),
  );

  return formatter.getStructureFromStructAsync(
    struct,
    drawingEntitiesManagerCloningResult?.mergedDrawingEntities,
    selection,
  );
}

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
  const factory = createFormatterFactory(structService);
  const options = ketcherInstance.editor.options();

  const service = factory.create(format, {
    'dearomatize-on-load': options['dearomatize-on-load'],
    ignoreChiralFlag: options.ignoreChiralFlag,
  });
  return service.getStructureFromStringAsync(structStr);
}

export function deleteAllEntitiesOnCanvas() {
  const editor = getCoreEditorInstance();
  const modelChanges = editor.drawingEntitiesManager.deleteAllEntities();

  updateEditorHistory(editor, modelChanges);
  editor.renderersContainer.update(modelChanges);
}

export async function parseAndAddMacromoleculesOnCanvas(
  struct: string,
  structService: StructService,
  mergeWithLatestHistoryCommand = false,
) {
  const editor = getCoreEditorInstance();
  const { KetSerializer } = require('domain/serializers/ket/ketSerializer');
  const ketSerializer = new KetSerializer();
  const format = identifyStructFormat(struct);
  let ketStruct = struct;
  if (format !== SupportedFormat.ket) {
    ketStruct = (
      await structService.convert({
        struct,
        output_format: ChemicalMimeType.KET,
      })
    ).struct;
  }

  const deserialisedKet = ketSerializer.deserializeToDrawingEntities(ketStruct);
  assert(deserialisedKet);
  const { command: modelChanges } =
    deserialisedKet.drawingEntitiesManager.mergeInto(
      editor.drawingEntitiesManager,
    );

  updateEditorHistory(editor, modelChanges, mergeWithLatestHistoryCommand);
  editor.renderersContainer.update(modelChanges);
}
