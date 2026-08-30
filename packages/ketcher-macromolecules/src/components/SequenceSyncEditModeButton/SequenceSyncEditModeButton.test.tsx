/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { act, render, screen } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import { editorReducer } from 'state/common';
import { libraryReducer } from 'state/library';
import { modalReducer } from 'state/modal';
import { rnaBuilderReducer } from 'state/rna-builder';
import { EditorEvents } from '../../EditorEvents';
import { SequenceSyncEditModeButton } from '.';

jest.mock('hooks', () => ({
  ...jest.requireActual('hooks'),
  useLayoutMode: () => 'sequence-layout-mode',
}));

// Minimal stand-in for `Subscription` (ketcher-core) - just enough pub/sub
// behaviour to simulate the editor notifying subscribers about a completed
// model-change transaction, the same way `EditorHistory.update()` does after
// "Create RNA antisense" (or any other command) runs.
class FakeSubscription {
  private handlers: Array<(payload?: unknown) => void> = [];

  add = (handler: (payload?: unknown) => void) => {
    this.handlers.push(handler);
  };

  remove = (handler: (payload?: unknown) => void) => {
    this.handlers = this.handlers.filter((existing) => existing !== handler);
  };

  dispatch = (payload?: unknown) => {
    this.handlers.forEach((handler) => handler(payload));
  };
}

describe('SequenceSyncEditModeButton', () => {
  let hasAntisenseChains: boolean;
  let fakeEditor: {
    events: Record<string, FakeSubscription>;
    drawingEntitiesManager: { hasAntisenseChains: boolean };
    monomersLibrary: undefined;
    defaultRnaPresetsLibraryItems: undefined;
  };

  beforeEach(() => {
    hasAntisenseChains = false;
    // `EditorEvents` (rendered below, as it is in the real app) subscribes
    // to dozens of editor events. A Proxy lazily creates a `FakeSubscription`
    // for whichever event name is accessed, so the test doesn't need to
    // enumerate every one of them.
    const events = new Proxy({} as Record<string, FakeSubscription>, {
      get: (target, prop: string) => {
        if (!target[prop]) {
          target[prop] = new FakeSubscription();
        }

        return target[prop];
      },
    });
    fakeEditor = {
      events,
      drawingEntitiesManager: {
        get hasAntisenseChains() {
          return hasAntisenseChains;
        },
      } as unknown as { hasAntisenseChains: boolean },
      monomersLibrary: undefined,
      defaultRnaPresetsLibraryItems: undefined,
    };
  });

  // `EditorEvents` is the component that wires `editor.events.modelChange`
  // (the same transaction-completion notification `EditorHistory.update()`
  // dispatches after any command) into a Redux action. It's rendered here
  // alongside the button, exactly as they both are in the real app tree, so
  // the test exercises the actual notification pipeline instead of a stub.
  //
  // A dedicated store (rather than `withThemeAndStoreProvider`) is used here
  // because RTK's `immutableStateInvariantMiddleware` flags the `fakeEditor`
  // event subscriptions' internal handler arrays as "mutated state" when
  // `EditorEvents` subscribes to them - the same trade-off the app's own
  // store already accepts for `serializableCheck` (see `state/store.ts`)
  // since the mutable CoreEditor instance is intentionally kept in Redux
  // state.
  const renderComponents = () => {
    const store = configureStore({
      reducer: {
        editor: editorReducer,
        modal: modalReducer,
        library: libraryReducer,
        rnaBuilder: rnaBuilderReducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false,
          immutableCheck: false,
        }),
      preloadedState: {
        editor: {
          editor: fakeEditor,
          activeTool: 'select-rectangle',
          isContextMenuActive: false,
          selectedMenuGroupItems: {},
        },
      },
    } as never);

    return render(
      withThemeProvider(
        <Provider store={store}>
          <SequenceSyncEditModeButton />
          <EditorEvents />
        </Provider>,
      ),
    );
  };

  it('is hidden while there is no antisense chain', () => {
    renderComponents();

    expect(
      screen.queryByTestId('sync_sequence_edit_mode'),
    ).not.toBeInTheDocument();
  });

  it('becomes visible immediately after an antisense chain is created, without any extra mouse/keyboard/hover interaction', () => {
    renderComponents();

    expect(
      screen.queryByTestId('sync_sequence_edit_mode'),
    ).not.toBeInTheDocument();

    // "Create RNA antisense" mutates the drawing entities manager first...
    hasAntisenseChains = true;
    // ...then the editor fires its model-change transaction-completion
    // notification, exactly as `EditorHistory.update()` does after any
    // command - no other user interaction should be required.
    act(() => {
      fakeEditor.events.modelChange.dispatch();
    });

    expect(screen.getByTestId('sync_sequence_edit_mode')).toBeInTheDocument();
  });
});
