import { vi } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';
import { App } from './App';

const { mockDispatch, mockUseSelector, mockRemoveKetcherInstance } = vi.hoisted(
  () => ({
    mockDispatch: vi.fn(),
    mockUseSelector: vi.fn(),
    mockRemoveKetcherInstance: vi.fn(),
  }),
);

vi.mock('@mui/material', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  Snackbar: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open: boolean;
  }) => (open ? <div>{children}</div> : null),
  createTheme: () => ({}),
}));

vi.mock('../views/toolbars', () => ({
  BottomToolbarContainer: () => <div data-testid="bottom-toolbar" />,
  LeftToolbarContainer: () => <div data-testid="left-toolbar" />,
  RightToolbarContainer: () => <div data-testid="right-toolbar" />,
  TopToolbarContainer: () => <div data-testid="top-toolbar" />,
}));

vi.mock('../views/AppClipArea', () => ({
  default: () => <div data-testid="app-clip-area" />,
}));
vi.mock('./AppHidden', () => ({
  AppHiddenContainer: () => <div data-testid="app-hidden-container" />,
}));
vi.mock('../views/modal', () => ({
  default: () => <div data-testid="app-modal-container" />,
}));
vi.mock('../views/Editor', () => ({
  default: () => <div data-testid="connected-editor" />,
}));
vi.mock('../dialog/AbbreviationLookup', () => ({
  AbbreviationLookupContainer: () => (
    <div data-testid="abbreviation-lookup-container" />
  ),
}));

vi.mock('../../../hooks', () => ({
  useAppContext: () => ({ ketcherId: 'test-ketcher-id', prevKetcherId: '' }),
  useSettings: vi.fn(),
  useSubscriptionOnEvents: vi.fn(),
}));

vi.mock('../state/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

vi.mock('../state/functionalGroups', () => ({
  initFGroups: vi.fn(() => ({ type: 'INIT_FGROUPS' })),
  initFGTemplates: vi.fn(() => ({ type: 'INIT_FG_TEMPLATES' })),
}));

vi.mock('../state/saltsAndSolvents', () => ({
  initSaltsAndSolvents: vi.fn(() => ({ type: 'INIT_SALTS_AND_SOLVENTS' })),
  initSaltsAndSolventsTemplates: vi.fn(() => ({
    type: 'INIT_SALTS_AND_SOLVENTS_TEMPLATES',
  })),
}));

vi.mock('../state/templates/init-lib', () => ({
  initLib: vi.fn(() => ({ type: 'INIT_LIB' })),
}));

vi.mock('ketcher-core', () => ({
  ketcherProvider: {
    removeKetcherInstance: (...args: unknown[]) =>
      mockRemoveKetcherInstance(...args),
  },
}));

vi.mock('react-redux', () => ({
  useSelector: (selector: (state: unknown) => unknown) =>
    mockUseSelector(selector),
}));

vi.mock('components', () => ({
  IconButton: ({
    testId,
    onClick,
  }: {
    testId: string;
    onClick: () => void;
  }) => (
    <button data-testid={testId} onClick={onClick} type="button">
      close
    </button>
  ),
}));

describe('App notification banner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSelector.mockImplementation((selector) =>
      selector({
        notifications: {
          snackbarNotificationText:
            'The monomer was successfully added to the library.',
        },
      }),
    );
  });

  it('renders test ids for the notification banner and close button', () => {
    render(<App checkServer={vi.fn()} />);

    expect(screen.getByTestId('notification-banner')).toHaveTextContent(
      'The monomer was successfully added to the library.',
    );
    expect(
      screen.getByTestId('notification-banner-close-button'),
    ).toBeInTheDocument();
  });

  it('hides the notification when the close button is clicked', () => {
    render(<App checkServer={vi.fn()} />);

    fireEvent.click(screen.getByTestId('notification-banner-close-button'));

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'HIDE_SNACKBAR_NOTIFICATION',
    });
  });
});
