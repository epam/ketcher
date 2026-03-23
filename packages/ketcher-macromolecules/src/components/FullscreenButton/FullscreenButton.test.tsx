import { fireEvent, render, screen } from '@testing-library/react';

import { FullscreenButton } from '.';

const mockGetFullscreenElement = jest.fn();

jest.mock('ketcher-react', () => ({
  IconButton: ({
    onClick,
    iconName,
    testId,
  }: {
    onClick: () => void;
    iconName: string;
    testId: string;
  }) => (
    <button data-icon-name={iconName} data-testid={testId} onClick={onClick} />
  ),
  getFullscreenElement: () => mockGetFullscreenElement(),
}));

describe('FullscreenButton component', () => {
  const mockExitFullscreen = jest.fn();
  const mockRequestFullscreen = jest.fn();
  let fullscreenElement: Element | null = null;

  beforeEach(() => {
    fullscreenElement = null;

    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get: () => fullscreenElement,
    });

    Object.defineProperty(document, 'exitFullscreen', {
      configurable: true,
      value: mockExitFullscreen,
    });

    const container = document.createElement('div') as HTMLDivElement & {
      requestFullscreen: jest.Mock;
    };
    container.requestFullscreen = mockRequestFullscreen;
    mockGetFullscreenElement.mockReturnValue(container);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should sync button state with document fullscreen changes', () => {
    render(<FullscreenButton />);

    const button = screen.getByTestId('fullscreen-mode-button');

    expect(button).toHaveAttribute('data-icon-name', 'fullscreen-enter');

    fullscreenElement = document.createElement('div');
    fireEvent(document, new Event('fullscreenchange'));

    expect(button).toHaveAttribute('data-icon-name', 'fullscreen-exit');
  });

  it('should exit fullscreen when document is already in fullscreen mode', () => {
    render(<FullscreenButton />);

    fullscreenElement = document.createElement('div');
    fireEvent(document, new Event('fullscreenchange'));
    fireEvent.click(screen.getByTestId('fullscreen-mode-button'));

    expect(mockExitFullscreen).toHaveBeenCalledTimes(1);
    expect(mockRequestFullscreen).not.toHaveBeenCalled();
  });
});
