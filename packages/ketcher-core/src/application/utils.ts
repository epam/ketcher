import { Struct } from 'domain/entities';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import {
  FormatterFactory,
  SupportedFormat,
  identifyStructFormat,
} from './formatters';
import { Ketcher } from './ketcher';
import { ChemicalMimeType, StructService } from 'domain/services';
import { CoreEditor, EditorHistory } from './editor/internal';
import { KetSerializer } from 'domain/serializers';
import assert from 'assert';
import { EditorSelection } from './editor/editor.types';
import { ketcherProvider } from './ketcherProvider';

export function getStructure(
  ketcherId: string,
  structureFormat = SupportedFormat.rxn,
  formatterFactory: FormatterFactory,
  struct: Struct,
  drawingEntitiesManager?: DrawingEntitiesManager,
  coreEditorId: string | null = null,
  selection?: EditorSelection,
): Promise<string> {
  const ketcher = ketcherProvider.getKetcher(ketcherId);
  const serverSettings = ketcher.editor.serverSettings;
  const formatter = formatterFactory.create(structureFormat, serverSettings);
  const drawingEntitiesManagerCloningResult = drawingEntitiesManager?.mergeInto(
    new DrawingEntitiesManager(coreEditorId),
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
  const factory = new FormatterFactory(
    structService,
    ketcherInstance.coreEditorId,
  );
  const options = ketcherInstance.editor.options();

  const service = factory.create(format, {
    'dearomatize-on-load': options['dearomatize-on-load'],
    ignoreChiralFlag: options.ignoreChiralFlag,
  });
  return service.getStructureFromStringAsync(structStr);
}

export function deleteAllEntitiesOnCanvas(coreEditorId: string | null = null) {
  const editor = coreEditorId
    ? CoreEditor.provideEditorInstance(coreEditorId)
    : undefined;
  const modelChanges = editor?.drawingEntitiesManager.deleteAllEntities();
  editor?.renderersContainer.update(modelChanges);
}

export async function parseAndAddMacromoleculesOnCanvas(
  struct: string,
  structService: StructService,
  coreEditorId: string | null = null,
) {
  if (!coreEditorId) {
    return;
  }
  const editor = CoreEditor.provideEditorInstance(coreEditorId);
  const ketSerializer = new KetSerializer(coreEditorId);
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
  assert(editor);
  const { command: modelChanges } =
    deserialisedKet.drawingEntitiesManager.mergeInto(
      editor.drawingEntitiesManager,
    );

  new EditorHistory(editor).update(modelChanges);
  editor.renderersContainer.update(modelChanges);
}
