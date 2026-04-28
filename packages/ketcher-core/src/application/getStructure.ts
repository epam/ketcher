import { EditorSelection } from './editor/editor.types';
import { ketcherProvider } from './ketcherProvider';
import { FormatterFactory, SupportedFormat } from './formatters';
import { Struct } from 'domain/entities';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';

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

  return formatter.getStringFromStructureAsync(
    struct,
    drawingEntitiesManagerCloningResult?.mergedDrawingEntities,
    selection,
  );
}
