import { render, screen } from '@testing-library/react';
import { useSelector } from 'react-redux';
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
  jest.mocked(useSelector).mockReturnValue({
    ketcherRootElementBoundingClientRect: { x: 100, y: 50 },
  });
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

it('preserves pointer events outside popup mode', () => {
  const target = document.createElement('div');
  jest.mocked(useAppSelector).mockReturnValue({
    type: PreviewType.Text,
    text: 'Preview',
    target,
  });
  jest.mocked(useSelector).mockReturnValue({
    ketcherRootElementBoundingClientRect: { x: 0, y: 0 },
  });

  render(withThemeProvider(<Preview />));

  expect(screen.getByTestId('text-preview').parentElement).toHaveStyle({
    pointerEvents: 'auto',
  });
});
