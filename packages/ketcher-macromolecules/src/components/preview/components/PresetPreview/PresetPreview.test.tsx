import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';
import PresetPreview from './PresetPreview';
import { configureAppStore } from 'state';
import { showPreview } from 'state/common';
import { PresetPosition, PreviewType } from 'state/types';
import { preset } from 'src/testMockData/monomerPresets';

describe('PresetPreview', () => {
  it('shows the AxoLabs alias from preset preview data', () => {
    const store = configureAppStore();
    const sugar = {
      ...preset.sugar,
      props: { ...preset.sugar?.props, id: 'sugar-id' },
    };
    const base = {
      ...preset.base,
      props: { ...preset.base?.props, id: 'base-id' },
    };
    const phosphate = {
      ...preset.phosphate,
      props: { ...preset.phosphate?.props, id: 'phosphate-id' },
    };

    store.dispatch(
      showPreview({
        type: PreviewType.Preset,
        monomers: [sugar, base, phosphate],
        name: preset.name,
        aliasAxoLabs: 'A',
        position: PresetPosition.Library,
      }),
    );

    render(
      <Provider store={store}>{withThemeProvider(<PresetPreview />)}</Provider>,
    );

    const preview = screen.getByTestId('polymer-library-preview');

    expect(preview).toHaveAttribute('data-axolabs', 'A');
    expect(screen.getByText('AxoLabs:')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
  });
});
