import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import type * as ReactTypes from 'react';
import { ketcherProvider, type Ketcher } from 'ketcher-core';
import { Editor } from '../Editor';

jest.mock('../MicromoleculesEditor', () => {
  const React = jest.requireActual('react') as typeof ReactTypes;

  return {
    MicromoleculesEditor: ({
      onInit,
      onSetKetcherId,
      togglerComponent,
    }: {
      onInit?: (ketcher: { id: string; editor: object }) => void;
      onSetKetcherId?: (id: string) => void;
      togglerComponent?: ReactTypes.ReactNode;
    }) => {
      const didInitialize = React.useRef(false);

      React.useEffect(() => {
        if (didInitialize.current) {
          return;
        }

        didInitialize.current = true;
        onSetKetcherId?.('disable-macromolecules-test');
        onInit?.({
          id: 'disable-macromolecules-test',
          editor: {},
        });
      }, [onInit, onSetKetcherId]);

      return React.createElement(
        React.Fragment,
        null,
        togglerComponent,
        React.createElement('div', {
          'data-testid': 'molecules-editor',
        }),
      );
    },
  };
});

jest.mock('../script/ui/views/toolbars/ModeControl', () => {
  const React = jest.requireActual('react') as typeof ReactTypes;

  return {
    ModeControl: ({ toggle }: { toggle: (value: boolean) => void }) =>
      React.createElement(
        'button',
        {
          'data-testid': 'mode-control',
          onClick: () => toggle(true),
        },
        'Toggle mode',
      ),
  };
});

jest.mock(
  'ketcher-macromolecules',
  () => {
    const React = jest.requireActual('react') as typeof ReactTypes;

    (
      globalThis as typeof globalThis & {
        macromoleculesEditorImportTriggered?: boolean;
      }
    ).macromoleculesEditorImportTriggered = true;

    return {
      __esModule: true,
      default: () =>
        React.createElement('div', {
          'data-testid': 'macromolecules-editor',
        }),
    };
  },
  { virtual: true },
);

const TEST_KETCHER_ID = 'disable-macromolecules-test';
const testKetcher = {
  id: TEST_KETCHER_ID,
  editor: {},
} as unknown as Ketcher;
const globalWithImportState = globalThis as typeof globalThis & {
  macromoleculesEditorImportTriggered?: boolean;
};
const editorProps: Omit<
  ReactTypes.ComponentProps<typeof Editor>,
  'disableMacromoleculesEditor' | 'onInit'
> = {
  staticResourcesUrl: '',
  structServiceProvider: {} as ReactTypes.ComponentProps<
    typeof Editor
  >['structServiceProvider'],
  errorHandler: jest.fn(),
};

describe('Editor', () => {
  beforeEach(() => {
    ketcherProvider.removeKetcherInstance(TEST_KETCHER_ID);
    ketcherProvider.addKetcherInstance(testKetcher);
    globalWithImportState.macromoleculesEditorImportTriggered = false;
    window.isPolymerEditorTurnedOn = true;
  });

  afterEach(() => {
    cleanup();
    ketcherProvider.removeKetcherInstance(TEST_KETCHER_ID);
    delete globalWithImportState.macromoleculesEditorImportTriggered;
  });

  it('skips the macromolecules import when disabled and safely restores it when enabled', async () => {
    const onInit = jest.fn();
    const props = { ...editorProps, onInit };

    const { rerender } = render(
      <Editor {...props} disableMacromoleculesEditor />,
    );

    expect(screen.getByTestId('molecules-editor')).toBeInTheDocument();
    expect(screen.queryByTestId('mode-control')).not.toBeInTheDocument();

    await waitFor(() => {
      expect(onInit).toHaveBeenCalledWith(testKetcher);
      expect(window.isPolymerEditorTurnedOn).toBe(false);
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(globalWithImportState.macromoleculesEditorImportTriggered).toBe(
      false,
    );
    expect(
      screen.queryByTestId('macromolecules-editor'),
    ).not.toBeInTheDocument();

    rerender(<Editor {...props} />);

    await waitFor(() => {
      expect(globalWithImportState.macromoleculesEditorImportTriggered).toBe(
        true,
      );
      expect(screen.getByTestId('macromolecules-editor')).toBeInTheDocument();
      expect(screen.getByTestId('mode-control')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('mode-control'));
    expect(window.isPolymerEditorTurnedOn).toBe(true);

    rerender(<Editor {...props} disableMacromoleculesEditor />);

    await waitFor(() => {
      expect(window.isPolymerEditorTurnedOn).toBe(false);
      expect(screen.queryByTestId('macromolecules-editor')).toBeNull();
      expect(screen.queryByTestId('mode-control')).toBeNull();
    });
    expect(onInit).toHaveBeenCalledTimes(1);
    expect(
      screen.getByTestId('molecules-editor').parentElement?.style.display,
    ).toBe('');
  });
});
