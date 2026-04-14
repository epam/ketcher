import { fireEvent, render, screen } from '@testing-library/react';
import { App } from './App';

const mockDispatch = jest.fn();
const mockUseSelector = jest.fn();
const mockRemoveKetcherInstance = jest.fn();

jest.mock('@mui/material', () => ({
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

jest.mock('../views/toolbars', () => ({
  BottomToolbarContainer: () => <div data-testid="bottom-toolbar" />,
  LeftToolbarContainer: () => <div data-testid="left-toolbar" />,
  RightToolbarContainer: () => <div data-testid="right-toolbar" />,
  TopToolbarContainer: () => <div data-testid="top-toolbar" />,
}));

jest.mock('../views/AppClipArea', () => () => (
  <div data-testid="app-clip-area" />
));
jest.mock('./AppHidden', () => ({
  AppHiddenContainer: () => <div data-testid="app-hidden-container" />,
}));
jest.mock('../views/modal', () => () => (
  <div data-testid="app-modal-container" />
));
jest.mock('../views/Editor', () => () => (
  <div data-testid="connected-editor" />
));
jest.mock('../dialog/AbbreviationLookup', () => ({
  AbbreviationLookupContainer: () => (
    <div data-testid="abbreviation-lookup-container" />
  ),
}));

jest.mock('../../../hooks', () => ({
  useAppContext: () => ({ ketcherId: 'test-ketcher-id', prevKetcherId: '' }),
  useSubscriptionOnEvents: jest.fn(),
}));

jest.mock('../state/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock('../state/functionalGroups', () => ({
  initFGroups: jest.fn(() => ({ type: 'INIT_FGROUPS' })),
  initFGTemplates: jest.fn(() => ({ type: 'INIT_FG_TEMPLATES' })),
}));

jest.mock('../state/saltsAndSolvents', () => ({
  initSaltsAndSolvents: jest.fn(() => ({ type: 'INIT_SALTS_AND_SOLVENTS' })),
  initSaltsAndSolventsTemplates: jest.fn(() => ({
    type: 'INIT_SALTS_AND_SOLVENTS_TEMPLATES',
  })),
}));

jest.mock('../state/templates/init-lib', () => ({
  initLib: jest.fn(() => ({ type: 'INIT_LIB' })),
}));

jest.mock('ketcher-core', () => ({
  ketcherProvider: {
    removeKetcherInstance: (...args: any[]) =>
      mockRemoveKetcherInstance(...args),
  },
}));

jest.mock('react-redux', () => ({
  useSelector: (selector: any) => mockUseSelector(selector),
}));

jest.mock('components', () => ({
  IconButton: ({ testId, onClick }: any) => (
    <button data-testid={testId} onClick={onClick} type="button">
      close
    </button>
  ),
}));

describe('App notification banner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    render(<App checkServer={jest.fn()} />);

    expect(screen.getByTestId('notification-banner')).toHaveTextContent(
      'The monomer was successfully added to the library.',
    );
    expect(
      screen.getByTestId('notification-banner-close-button'),
    ).toBeInTheDocument();
  });

  it('hides the notification when the close button is clicked', () => {
    render(<App checkServer={jest.fn()} />);

    fireEvent.click(screen.getByTestId('notification-banner-close-button'));

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'HIDE_SNACKBAR_NOTIFICATION',
    });
  });
});
