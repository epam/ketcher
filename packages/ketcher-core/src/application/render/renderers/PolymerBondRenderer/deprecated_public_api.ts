import { FlexModePolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/FlexModePolymerBondRenderer';
import { SnakeModePolymerBondRenderer } from 'application/render/renderers/PolymerBondRenderer/SnakeModePolymerBondRenderer';

// FIXME: Do we need to use this type outside of `ketcher-core`?
export type DeprecatedFlexModeOrSnakeModePolymerBondRenderer =
  | FlexModePolymerBondRenderer
  | SnakeModePolymerBondRenderer;
