import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';
import { ReactElement } from 'react';
import BondPreview from './BondPreview';
import { configureAppStore } from 'state';
import { showPreview } from 'state/common';
import { BondPreviewState, PreviewType } from 'state/types';

jest.mock('components/shared/ConnectionOverview/ConnectionOverview', () => ({
  __esModule: true,
  default: ({
    firstMonomer,
    secondMonomer,
    firstMonomerOverview,
    secondMonomerOverview,
  }: {
    firstMonomer: { label: string };
    secondMonomer: { label: string };
    firstMonomerOverview: ReactElement<{ selectedAttachmentPoint: string }>;
    secondMonomerOverview: ReactElement<{ selectedAttachmentPoint: string }>;
  }) => (
    <div data-testid="bond-preview-order">
      {`${firstMonomer.label}:${firstMonomerOverview.props.selectedAttachmentPoint} ${secondMonomer.label}:${secondMonomerOverview.props.selectedAttachmentPoint}`}
    </div>
  ),
}));

const createMonomer = (label: string, x: number) => ({
  label,
  position: { x, y: 0 },
  monomerCaps: {},
  attachmentPointsToBonds: {},
});

const renderBondPreview = (polymerBond: object) => {
  // A plain stand-in for the bond: the preview only reads its ends
  const bond = polymerBond as unknown as BondPreviewState['polymerBond'];
  const store = configureAppStore();

  store.dispatch(
    showPreview({
      type: PreviewType.Bond,
      polymerBond: bond,
      style: {},
    }),
  );

  render(
    <Provider store={store}>{withThemeProvider(<BondPreview />)}</Provider>,
  );

  return screen.getByTestId('bond-preview-order').textContent;
};

describe('BondPreview', () => {
  it('shows the monomers in canvas order when the bond starts on the right', () => {
    // A 5' phosphate preset: the bond starts at the sugar, drawn to the right
    // of its phosphate
    const order = renderBondPreview({
      firstMonomer: createMonomer('R', 10),
      secondMonomer: createMonomer('P', 9),
      firstMonomerAttachmentPoint: 'R1',
      secondMonomerAttachmentPoint: 'R2',
    });

    expect(order).toBe('P:R2 R:R1');
  });

  it('keeps the order of a bond drawn from left to right', () => {
    const order = renderBondPreview({
      firstMonomer: createMonomer('R', 9),
      secondMonomer: createMonomer('P', 10),
      firstMonomerAttachmentPoint: 'R2',
      secondMonomerAttachmentPoint: 'R1',
    });

    expect(order).toBe('R:R2 P:R1');
  });
});
