import { render, screen } from '@testing-library/react';
import { useAppSelector } from 'hooks';
import { Preview } from './Preview';
import { PreviewType } from 'state';

jest.mock('hooks', () => ({ useAppSelector: jest.fn() }));
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

it('preserves pointer pass-through after positioning and changing the target', () => {
  const target = document.createElement('div');
  const preview = { type: PreviewType.Text, text: 'Preview', target };
  jest.mocked(useAppSelector).mockReturnValue(preview);
  const { rerender } = render(withThemeProvider(<Preview />));
  expect(screen.getByTestId('text-preview').parentElement).toHaveStyle({
    pointerEvents: 'none',
  });

  jest.mocked(useAppSelector).mockReturnValue({ ...preview });
  rerender(withThemeProvider(<Preview />));
  expect(screen.getByTestId('text-preview').parentElement).toHaveStyle({
    pointerEvents: 'none',
  });
});
