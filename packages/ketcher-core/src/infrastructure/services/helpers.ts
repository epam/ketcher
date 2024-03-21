import { ShowHydrogenLabels } from 'application/render';
import { ketcherProvider } from 'application/utils';

enum IndigoShowHydrogenLabelsMode {
  OFF = 'none',
  HETERO = 'hetero',
  TERMINAL_HETERO = 'terminal-hetero',
  ALL = 'all',
}

export function getLabelRenderModeForIndigo() {
  const renderModeMapping = {
    [ShowHydrogenLabels.Off]: IndigoShowHydrogenLabelsMode.OFF,
    [ShowHydrogenLabels.Hetero]: IndigoShowHydrogenLabelsMode.HETERO,
    // Terminal does not supported by indigo
    [ShowHydrogenLabels.Terminal]: IndigoShowHydrogenLabelsMode.OFF,
    [ShowHydrogenLabels.TerminalAndHetero]:
      IndigoShowHydrogenLabelsMode.TERMINAL_HETERO,
    [ShowHydrogenLabels.On]: IndigoShowHydrogenLabelsMode.ALL,
  };

  return (
    renderModeMapping[
      ketcherProvider.getKetcher().editor.options().showHydrogenLabels
    ] || IndigoShowHydrogenLabelsMode.OFF
  );
}
