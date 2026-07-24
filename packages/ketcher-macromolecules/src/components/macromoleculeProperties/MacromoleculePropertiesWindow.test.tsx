import { SingleChainMacromoleculeProperties } from 'ketcher-core';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { MacromoleculePropertiesWindow } from './MacromoleculePropertiesWindow';

class ResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

const renderMacromoleculePropertiesWindow = (
  properties: SingleChainMacromoleculeProperties,
) =>
  render(
    withThemeAndStoreProvider(<MacromoleculePropertiesWindow />, {
      editor: {
        isMacromoleculesPropertiesWindowOpened: true,
        macromoleculesProperties: [properties],
        unipositiveIonsMeasurementUnit: 'mM',
        oligonucleotidesMeasurementUnit: 'μM',
        unipositiveIonsValue: '140',
        oligonucleotidesValue: '200',
      },
    }),
  );

describe('MacromoleculePropertiesWindow', () => {
  beforeAll(() => {
    Object.defineProperty(global, 'ResizeObserver', {
      configurable: true,
      value: ResizeObserver,
    });
    Object.defineProperty(SVGElement.prototype, 'width', {
      configurable: true,
      value: { baseVal: { value: 300 } },
    });
    Object.defineProperty(SVGElement.prototype, 'height', {
      configurable: true,
      value: { baseVal: { value: 90 } },
    });
  });

  it('shows lines for unavailable peptide properties and omits hydrophobicity x-axis labels', async () => {
    renderMacromoleculePropertiesWindow({
      monomerCount: { peptides: { A: 0 } },
    });

    await waitFor(() =>
      expect(screen.getByTestId('Isoelectric Point-value')).toHaveTextContent(
        '--',
      ),
    );

    expect(screen.getByTestId('Gross-formula')).toHaveTextContent('--');
    expect(screen.getByTestId('Molecular-Mass-Value')).toHaveTextContent('--');
    expect(
      screen.getByTestId('Extinction Coefficient-value'),
    ).toHaveTextContent('--');
    expect(screen.getByTestId('A-option')).toHaveTextContent('A--');

    await waitFor(() => {
      const chartLabels = [
        ...screen.getByTestId('Hydrophobicity-Chart').querySelectorAll('text'),
      ].map((label) => label.textContent);

      expect(chartLabels).toEqual(['0.0', '0.5', '1.0']);
    });
  });

  it('shows lines for unavailable RNA/DNA properties and disables concentration controls for ineligible chains', async () => {
    renderMacromoleculePropertiesWindow({
      monomerCount: { nucleotides: { A: 0 } },
      isMeltingTemperatureCalculationAvailable: false,
    });

    await waitFor(() =>
      expect(screen.getByTestId('Melting-Temperature-value')).toHaveTextContent(
        '--',
      ),
    );

    expect(screen.getByTestId('Gross-formula')).toHaveTextContent('--');
    expect(screen.getByTestId('Molecular-Mass-Value')).toHaveTextContent('--');
    expect(screen.getByTestId('A-option')).toHaveTextContent('A--');
    expect(screen.getByTestId('Unipositive Ions-input')).toBeDisabled();
    expect(screen.getByTestId('Oligonucleotides-input')).toBeDisabled();
    expect(
      within(screen.getByTestId('Unipositive Ions-selector')).getByRole(
        'combobox',
      ),
    ).toHaveAttribute('aria-disabled', 'true');
    expect(
      within(screen.getByTestId('Oligonucleotides-selector')).getByRole(
        'combobox',
      ),
    ).toHaveAttribute('aria-disabled', 'true');
  });

  it('keeps concentration controls enabled for eligible chains without melting temperature data', async () => {
    renderMacromoleculePropertiesWindow({
      monomerCount: { nucleotides: { A: 1 } },
      isMeltingTemperatureCalculationAvailable: true,
    });

    await waitFor(() =>
      expect(screen.getByTestId('Melting-Temperature-value')).toHaveTextContent(
        '--',
      ),
    );

    expect(screen.getByTestId('Unipositive Ions-input')).toBeEnabled();
    expect(screen.getByTestId('Oligonucleotides-input')).toBeEnabled();
    fireEvent.change(screen.getByTestId('Unipositive Ions-input'), {
      target: { value: '0,' },
    });
    expect(screen.getByTestId('Unipositive Ions-input')).toHaveValue('0,');
    fireEvent.change(screen.getByTestId('Unipositive Ions-input'), {
      target: { value: 'abc' },
    });
    expect(screen.getByTestId('Unipositive Ions-input')).toHaveValue('0,');
    expect(
      within(screen.getByTestId('Unipositive Ions-selector')).getByRole(
        'combobox',
      ),
    ).not.toHaveAttribute('aria-disabled', 'true');
    expect(
      within(screen.getByTestId('Oligonucleotides-selector')).getByRole(
        'combobox',
      ),
    ).not.toHaveAttribute('aria-disabled', 'true');
  });
});
