import { render, screen } from '@testing-library/react';
import { withThemeAndStoreProvider } from 'src/testUtils/storeProviders';
import { LeftMenuComponent } from './LeftMenuComponent';

describe('LeftMenuComponent shapes section', () => {
  it('renders a shapes dropdown whose visible tool is the rectangle', () => {
    render(withThemeAndStoreProvider(<LeftMenuComponent />));

    expect(screen.getByTestId('shapes-drop-down-button')).toBeTruthy();
    expect(screen.getByTestId('shape-rectangle')).toBeTruthy();
  });
});
