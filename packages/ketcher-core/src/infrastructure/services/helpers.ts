import { ShowHydrogenLabels } from 'application/render';
import { ketcherProvider } from 'application/utils';

enum IndigoShowHydrogenLabelsMode {
  OFF = 'none',
  HETERO = 'hetero',
  TERMINAL_HETERO = 'terminal-hetero',
  ALL = 'all',
}

export function getLabelRenderModeForIndigo() {
  // Terminal does not supported by indigo so TERMINAL_HETERO used
  // Off removing all labels in indigo so HETERO used
  const renderModeMapping = {
    [ShowHydrogenLabels.Off]: IndigoShowHydrogenLabelsMode.HETERO,
    [ShowHydrogenLabels.Hetero]: IndigoShowHydrogenLabelsMode.HETERO,
    [ShowHydrogenLabels.Terminal]: IndigoShowHydrogenLabelsMode.TERMINAL_HETERO,
    [ShowHydrogenLabels.TerminalAndHetero]:
      IndigoShowHydrogenLabelsMode.TERMINAL_HETERO,
    [ShowHydrogenLabels.On]: IndigoShowHydrogenLabelsMode.ALL,
  };

  return (
    renderModeMapping[
      ketcherProvider.getKetcher()?.editor.options().showHydrogenLabels
    ] || IndigoShowHydrogenLabelsMode.OFF
  );
}
