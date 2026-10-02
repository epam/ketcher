import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { useAppSelector } from 'hooks';
import { Preview } from './Preview';
import { PreviewType } from 'state';
import { withThemeProvider } from 'src/testUtils/themeProvider';

vi.mock('hooks', () => ({ useAppSelector: vi.fn() }));
vi.mock('react-redux', async () => ({
  ...(await vi.importActual<typeof import('react-redux')>('react-redux')),
  useSelector: vi.fn(),
}));

it('preserves pointer pass-through after positioning and changing the target', () => {
  const target = document.createElement('div');
  const preview = { type: PreviewType.Text, text: 'Preview', target };
  vi.mocked(useAppSelector).mockReturnValue(preview);
  vi.mocked(useSelector).mockReturnValue({
    ketcherRootElementBoundingClientRect: { x: 100, y: 50 },
  });
  const { rerender } = render(withThemeProvider(<Preview />));
  expect(screen.getByTestId('text-preview').parentElement).toHaveStyle({
    pointerEvents: 'none',
  });

  vi.mocked(useAppSelector).mockReturnValue({ ...preview });
  rerender(withThemeProvider(<Preview />));
  expect(screen.getByTestId('text-preview').parentElement).toHaveStyle({
    pointerEvents: 'none',
  });
});

it('preserves pointer events outside popup mode', () => {
  const target = document.createElement('div');
  vi.mocked(useAppSelector).mockReturnValue({
    type: PreviewType.Text,
    text: 'Preview',
    target,
  });
  vi.mocked(useSelector).mockReturnValue({
    ketcherRootElementBoundingClientRect: { x: 0, y: 0 },
  });

  render(withThemeProvider(<Preview />));

  expect(screen.getByTestId('text-preview').parentElement).toHaveStyle({
    pointerEvents: 'auto',
  });
});
