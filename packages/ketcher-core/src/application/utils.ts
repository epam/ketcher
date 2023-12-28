import { Struct, Vec2 } from 'domain/entities';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import {
  FormatterFactory,
  SupportedFormat,
  identifyStructFormat,
} from './formatters';
import { Ketcher } from './ketcher';
import { ChemicalMimeType, StructService } from 'domain/services';
import { Coordinates, CoreEditor, EditorHistory } from './editor';
import { KetSerializer } from 'domain/serializers';
import assert from 'assert';

class KetcherProvider {
  private ketcherInstance: Ketcher | undefined;

  setKetcherInstance(ketcherInstance: Ketcher) {
    this.ketcherInstance = ketcherInstance;
  }

  getKetcher() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.ketcherInstance!;
  }
}

const ketcherProvider = new KetcherProvider();

export { ketcherProvider };

export function getStructure(
  structureFormat = SupportedFormat.rxn,
  formatterFactory: FormatterFactory,
  struct: Struct,
  drawingEntitiesManager?: DrawingEntitiesManager,
): Promise<string> {
  const formatter = formatterFactory.create(structureFormat);
  return formatter.getStructureFromStructAsync(struct, drawingEntitiesManager);
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
    'ignore-no-chiral-flag': options.ignoreChiralFlag,
  });
  return service.getStructureFromStringAsync(structStr);
}

export function deleteAllEntitiesOnCanvas() {
  const editor = CoreEditor.provideEditorInstance();
  const modelChanges = editor.drawingEntitiesManager.deleteAllEntities();
  editor.renderersContainer.update(modelChanges);
}

export async function parseAndAddMacromoleculesOnCanvas(
  struct: string,
  structService: StructService,
) {
  const editor = CoreEditor.provideEditorInstance();
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
  const mergeCommand =
    deserialisedKet.drawingEntitiesManager.mergeDrawingEntities(
      editor.drawingEntitiesManager,
    );
  deserialisedKet.modelChanges.merge(mergeCommand);
  new EditorHistory(editor).update(deserialisedKet.modelChanges);
  editor.renderersContainer.update(deserialisedKet.modelChanges);
}

export function getCurrentCenterPointOfCanvas() {
  const editor = CoreEditor.provideEditorInstance();
  const originalCenterPointOfCanvas = new Vec2(
    editor.canvasOffset.width / 2,
    editor.canvasOffset.height / 2,
  );
  return Coordinates.viewToCanvas(originalCenterPointOfCanvas);
}
