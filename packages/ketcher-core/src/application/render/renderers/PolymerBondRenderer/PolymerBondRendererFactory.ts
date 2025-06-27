import { CoreEditor } from 'application/editor';
import { FlexModePolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/FlexModePolymerBondRenderer';
import { SnakeModePolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/SnakeModePolymerBondRenderer';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { HydrogenBond } from 'domain/entities/HydrogenBond';

export enum LayoutMode {
  Flex = 'Flex',
  Snake = 'Snake',
}

type PolymerBondRendererClass =
  | FlexModePolymerBondRenderer
  | SnakeModePolymerBondRenderer;
type PolymerBondRendererClassType =
  | typeof FlexModePolymerBondRenderer
  | typeof SnakeModePolymerBondRenderer;
const polymerBondRendererMap = new Map<
  LayoutMode,
  PolymerBondRendererClassType
>([
  [LayoutMode.Flex, FlexModePolymerBondRenderer],
  [LayoutMode.Snake, SnakeModePolymerBondRenderer],
]);

export class PolymerBondRendererFactory {
  public static createInstance(
    polymerBond: PolymerBond | HydrogenBond,
    coreEditorId: string,
  ): PolymerBondRendererClass {
    const mode = checkIfIsSnakeMode(coreEditorId)
      ? LayoutMode.Snake
      : LayoutMode.Flex;
    return polymerBond instanceof HydrogenBond
      ? new SnakeModePolymerBondRenderer(polymerBond, coreEditorId)
      : (PolymerBondRendererFactory.createInstanceByMode(
          mode,
          polymerBond,
          coreEditorId,
        ) as PolymerBondRendererClass);
  }

  public static createInstanceByMode(
    mode: LayoutMode,
    polymerBond: PolymerBond,
    coreEditorId: string,
  ): PolymerBondRendererClass | never {
    const RendererClass = polymerBondRendererMap.get(mode);
    if (!RendererClass) {
      throw new Error(
        `PolymerBondRenderer for the layout mode “${mode}” not found.`,
      );
    }
    return new RendererClass(polymerBond, coreEditorId);
  }
}

function checkIfIsSnakeMode(coreEditorId: string): boolean {
  const editor = CoreEditor.provideEditorInstance(coreEditorId);
  return editor?.mode.modeName === 'snake-layout-mode';
}
