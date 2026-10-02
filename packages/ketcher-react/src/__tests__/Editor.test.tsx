import { vi } from 'vitest';

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import type * as ReactTypes from 'react';
import { ketcherProvider, type Ketcher } from 'ketcher-core';
import { Editor } from '../Editor';

vi.mock('../MicromoleculesEditor', async () => {
  const React = await import('react');

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

vi.mock('ketcher-macromolecules', async () => {
  const React = await import('react');

  return {
    __esModule: true,
    default: () =>
      React.createElement('div', {
        'data-testid': 'macromolecules-editor',
      }),
  };
});

const TEST_KETCHER_ID = 'disable-macromolecules-test';
const testKetcher = {
  id: TEST_KETCHER_ID,
  editor: {},
} as unknown as Ketcher;
const editorProps: Omit<
  ReactTypes.ComponentProps<typeof Editor>,
  'disableMacromoleculesEditor' | 'onInit'
> = {
  staticResourcesUrl: '',
  structServiceProvider: {} as ReactTypes.ComponentProps<
    typeof Editor
  >['structServiceProvider'],
  errorHandler: vi.fn(),
};

describe('Editor', () => {
  beforeEach(() => {
    ketcherProvider.removeKetcherInstance(TEST_KETCHER_ID);
    ketcherProvider.addKetcherInstance(testKetcher);
  });

  afterEach(() => {
    cleanup();
    ketcherProvider.removeKetcherInstance(TEST_KETCHER_ID);
  });

  it('does not expose macromolecules UI when the feature is disabled', () => {
    render(<Editor {...editorProps} disableMacromoleculesEditor />);

    expect(screen.queryByTestId('polymer-toggler')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('macromolecules-editor'),
    ).not.toBeInTheDocument();
  });

  it('reports micromolecules initialization when the feature is disabled', async () => {
    const onInit = vi.fn();

    render(
      <Editor {...editorProps} onInit={onInit} disableMacromoleculesEditor />,
    );

    expect(screen.getByTestId('molecules-editor')).toBeInTheDocument();
    await waitFor(() => {
      expect(onInit).toHaveBeenCalledWith(testKetcher);
    });
  });

  it('loads the macromolecules editor when the feature is enabled', async () => {
    render(<Editor {...editorProps} />);

    expect(
      await screen.findByTestId('macromolecules-editor'),
    ).toBeInTheDocument();
  });

  it('exposes the mode switcher when the feature is enabled', () => {
    render(<Editor {...editorProps} />);

    expect(screen.getByTestId('polymer-toggler')).toBeInTheDocument();
  });
});
