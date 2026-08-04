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

// This test exercises the REAL "Create RNA antisense" runtime chain end to
// end, using a real `CoreEditor`/`DrawingEntitiesManager`/`EditorHistory`
// (not a stub), to verify every hop:
//
//   editor.events.createAntisenseChain.dispatch(...)  (what the context menu does)
//   -> CoreEditor.onCreateAntisenseChain
//   -> DrawingEntitiesManager.createAntisenseChain (model mutation)
//   -> EditorHistory.update (transaction)
//   -> editor.events.modelChange.dispatch()
//   -> EditorEvents' modelChange listener
//   -> notifyModelChange Redux dispatch
//   -> hasAntisenseChains selector
//   -> SequenceSyncEditModeButton render
//
// It deliberately does NOT dispatch `modelChange` manually - it only fires
// the same event the context-menu item fires, and checks that the button
// appears with no further mouse/keyboard/hover/canvas interaction.

import { act, render, screen } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import {
  CoreEditor,
  EditorHistory,
  RenderersManager,
  Nucleotide,
  Vec2,
} from 'ketcher-core';

import { editorReducer } from 'state/common';
import { libraryReducer } from 'state/library';
import { modalReducer } from 'state/modal';
import { rnaBuilderReducer } from 'state/rna-builder';
import { defaultTheme } from 'theming/defaultTheme';
import { EditorEvents } from '../../EditorEvents';
import { SequenceSyncEditModeButton } from '.';

jest.mock('hooks', () => ({
  ...jest.requireActual('hooks'),
  useLayoutMode: () => 'sequence-layout-mode',
}));

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

(SVGElement.prototype as unknown as { getBBox: () => DOMRect }).getBBox = jest
  .fn()
  .mockReturnValue({
    x: 0,
    y: 0,
    width: 12,
    height: 12,
  });

const createSvgElement = (qualifiedName: string): SVGElement =>
  document.createElementNS('http://www.w3.org/2000/svg', qualifiedName);

// Mirrors `createPolymerEditorCanvas` from ketcher-core's own test helpers
// (packages/ketcher-core/__tests__/helpers/dom.ts) - duplicated here because
// that helper lives under ketcher-core's private `__tests__` folder and
// isn't part of the package's public surface.
const createPolymerEditorCanvas = (): SVGSVGElement => {
  const canvas = createSvgElement('svg') as unknown as SVGSVGElement;

  canvas.setAttribute('id', 'polymer-editor-canvas');
  canvas.setAttribute('width', '500');
  canvas.setAttribute('height', '500');
  document.body.appendChild(canvas);

  const defs = createSvgElement('defs');

  canvas.appendChild(defs);

  const drawnStructuresWrapper = createSvgElement('g');
  drawnStructuresWrapper.classList.add('drawn-structures');
  canvas.appendChild(drawnStructuresWrapper);

  Object.defineProperty(canvas, 'width', {
    configurable: true,
    value: { baseVal: { value: 500 } },
  });
  Object.defineProperty(canvas, 'height', {
    configurable: true,
    value: { baseVal: { value: 500 } },
  });

  return canvas;
};

describe('SequenceSyncEditModeButton - real Create RNA antisense flow', () => {
  let canvas: SVGSVGElement;
  let editor: CoreEditor;
  let history: EditorHistory;

  beforeEach(() => {
    canvas = createPolymerEditorCanvas();
    editor = new CoreEditor({
      canvas,
      // `CoreEditor`/`RenderersManager` are typed as expecting the theme
      // nested under `ketcher`, but the renderers actually consulted here
      // (e.g. `PhosphateRenderer.getMonomerColor`) read `theme.monomer.color`
      // flat at runtime - the same flat shape production passes via the
      // `createEditor` Redux action. Cast to satisfy the (looser than
      // reality) type.
      theme: defaultTheme as never,
      renderersContainer: new RenderersManager({
        theme: defaultTheme as never,
      }),
    });
    // `EditorHistory` is a module-level singleton keyed by whichever editor
    // first calls `getInstance`. It must be reset after every test, or the
    // next test's `history.update()` calls would silently operate on a
    // *stale* editor instance and never reach this test's `modelChange`
    // subscribers (see EditorHistory.test.ts for the same convention).
    history = EditorHistory.getInstance(editor);
  });

  afterEach(() => {
    history.destroy();
    canvas.remove();
  });

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
          editor,
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

  it('shows the Sync button immediately after the real "Create RNA antisense" action, with no further interaction', () => {
    renderComponents();

    expect(
      screen.queryByTestId('sync_sequence_edit_mode'),
    ).not.toBeInTheDocument();
    expect(editor.drawingEntitiesManager.hasAntisenseChains).toBe(false);

    // "Enter/add nucleotide A, select the added nucleotide" from the repro
    // steps.
    Nucleotide.createOnCanvas('A', new Vec2(0, 0));
    editor.drawingEntitiesManager.selectDrawingEntities([
      ...editor.drawingEntitiesManager.monomers.values(),
    ]);

    // Fire the exact event the "Create RNA antisense" context-menu item
    // dispatches - see
    // components/contextMenu/SequenceItemContextMenu/SequenceItemContextMenu.tsx
    // and .../SelectedMonomersContextMenu/SelectedMonomersContextMenu.tsx:
    //   editor.events.createAntisenseChain.dispatch(false)
    act(() => {
      editor.events.createAntisenseChain.dispatch(false);
    });

    // Step 1: the model mutation happened.
    expect(editor.drawingEntitiesManager.hasAntisenseChains).toBe(true);

    // Steps 2-5: the notification pipeline propagated all the way to the
    // button with no extra mouse/keyboard/hover/canvas interaction.
    expect(screen.getByTestId('sync_sequence_edit_mode')).toBeInTheDocument();
  });
});
