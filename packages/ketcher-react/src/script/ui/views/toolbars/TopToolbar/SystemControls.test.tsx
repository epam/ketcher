import { vi } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';

import { SystemControls } from './SystemControls';

vi.mock('ketcher-core', () => ({
  shortcutStr: () => 'Shift+/',
}));

vi.mock('./TopToolbarIconButton', () => ({
  TopToolbarIconButton: ({
    testId,
    iconName,
    title,
    onClick,
  }: {
    testId: string;
    iconName: string;
    title: string;
    onClick: () => void;
  }) => (
    <button
      data-icon-name={iconName}
      data-testid={testId}
      onClick={onClick}
      title={title}
    />
  ),
}));

describe('SystemControls', () => {
  const defaultProps = {
    disabledButtons: [],
    hiddenButtons: [],
    onSettingsOpen: vi.fn(),
    onAboutOpen: vi.fn(),
    onFullscreen: vi.fn(),
    onHelp: vi.fn(),
  };

  let fullscreenElement: Element | null = null;

  beforeEach(() => {
    fullscreenElement = null;

    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get: () => fullscreenElement,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows fullscreen-enter icon when document is not fullscreen', () => {
    render(<SystemControls {...defaultProps} />);

    expect(screen.getByTestId('fullscreen-mode-button')).toHaveAttribute(
      'data-icon-name',
      'fullscreen-enter',
    );
  });

  it('updates fullscreen icon after document fullscreen state changes', () => {
    render(<SystemControls {...defaultProps} />);

    fullscreenElement = document.createElement('div');
    fireEvent(document, new Event('fullscreenchange'));

    expect(screen.getByTestId('fullscreen-mode-button')).toHaveAttribute(
      'data-icon-name',
      'fullscreen-exit',
    );
  });
});
