import { ShowHydrogenLabels } from 'application/render';
import { ketcherProvider } from 'application/ketcherProvider';

enum IndigoShowHydrogenLabelsMode {
  OFF = 'none',
  HETERO = 'hetero',
  TERMINAL_HETERO = 'terminal-hetero',
  ALL = 'all',
}

export function getLabelRenderModeForIndigo(ketcherId: string) {
  // Terminal does not supported by indigo so TERMINAL_HETERO used
  // Off removing all labels in indigo so HETERO used
  const editorOptions = ketcherProvider.getKetcher(ketcherId).editor.options();

  // carbonExplicitly requires all atom labels (including internal C) to be visible.
  // Indigo's only mode that shows internal carbons is 'all'.
  if (editorOptions.carbonExplicitly) {
    return IndigoShowHydrogenLabelsMode.ALL;
  }

  const renderModeMapping = {
    [ShowHydrogenLabels.Off]: IndigoShowHydrogenLabelsMode.HETERO,
    [ShowHydrogenLabels.Hetero]: IndigoShowHydrogenLabelsMode.HETERO,
    [ShowHydrogenLabels.Terminal]: IndigoShowHydrogenLabelsMode.TERMINAL_HETERO,
    [ShowHydrogenLabels.TerminalAndHetero]:
      IndigoShowHydrogenLabelsMode.TERMINAL_HETERO,
    [ShowHydrogenLabels.On]: IndigoShowHydrogenLabelsMode.ALL,
  };

  return (
    renderModeMapping[editorOptions.showHydrogenLabels] ||
    IndigoShowHydrogenLabelsMode.OFF
  );
}
