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

// Proves the first link of Task 5 Step 4's payload -> redux -> confirmation
// chain: that the real "Modify in RNA Builder..." click handler in this
// component dispatches setSequenceSelection with exactly the filtered,
// one-entry-per-position array that generateSequenceContextMenuProps
// produced - not the raw 2-entries-per-duplex-position selection Editor.ts
// hands it.
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import * as ketcherCore from 'ketcher-core';
import { withThemeProvider } from 'src/testUtils/themeProvider';

// This package's shared jest mock for react-contexify
// (src/testMocks/react-contexify.tsx) spreads an Item's props straight onto
// a <div>, which means a real DOM click calls its onClick with a native
// SyntheticEvent instead of the { id, props } ItemParams object the real
// react-contexify passes. handleMenuChange destructures { id, props } from
// its argument, so under the shared mock menuItemId is always undefined and
// no case in its switch ever runs - a click would silently prove nothing.
// This file overrides the mock locally so Item's onClick genuinely receives
// { id }, letting a real DOM click drive the real handleMenuChange switch.
vi.mock('react-contexify', async () => {
  const react = await vi.importActual<typeof import('react')>('react');

  const Item = ({
    children,
    id,
    onClick,
    hidden: _hidden,
    disabled: _disabled,
    ...rest
  }: {
    children?: React.ReactNode;
    id: string;
    onClick?: (params: { id: string; props?: unknown }) => void;
    hidden?: unknown;
    disabled?: unknown;
    [key: string]: unknown;
  }) =>
    react.createElement(
      'div',
      {
        ...rest,
        onClick: () => onClick?.({ id }),
      },
      children,
    );

  const Menu = ({
    children,
    ...rest
  }: {
    children?: React.ReactNode;
    [key: string]: unknown;
  }) => react.createElement('div', rest, children);

  const Separator = (rest: Record<string, unknown>) =>
    react.createElement('div', rest);

  const Submenu = ({
    children,
    ...rest
  }: {
    children?: React.ReactNode;
    [key: string]: unknown;
  }) => react.createElement('div', rest, children);

  return {
    Item,
    Menu,
    Separator,
    Submenu,
    contextMenu: { hideAll: vi.fn(), show: vi.fn() },
    useContextMenu: () => ({ show: vi.fn(), hideAll: vi.fn() }),
  };
});
import {
  Nucleotide,
  RNABase,
  Sugar,
  Phosphate,
  STRAND_TYPE,
  NodesSelection,
  KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR,
  EditorClassName,
} from 'ketcher-core';
import { configureAppStore } from 'state';
import {
  SequenceItemContextMenu,
  SequenceItemContextMenuNames,
} from './SequenceItemContextMenu';

const setSyncEditMode = (isSyncEditMode: boolean) => {
  vi.spyOn(ketcherCore, 'provideEditorInstance').mockReturnValue({
    mode: { isSyncEditMode },
    // getModifyAminoAcidsMenuItems (called on every render) unconditionally
    // walks editor.monomersLibrary regardless of the selection under test.
    monomersLibrary: [],
  } as unknown as ketcherCore.CoreEditor);
};

// Builds a bare Nucleotide fixture sufficient for generateLabeledNodes
// (rnaBase/sugar/phosphate labels) without pulling in the real monomer
// graph. monomersCache is deliberately emptied: the component also reads
// node.monomers for unrelated concerns (hydrogen bonds, amino acid
// modification, antisense-creation visibility) that this test does not
// exercise, and an empty list keeps those paths inert instead of throwing
// on unset hydrogenBonds/covalentBonds fields.
const buildNucleotide = (label: string, hasR1Connection: boolean) => {
  const rnaBase = Object.assign(Object.create(RNABase.prototype), {
    monomerItem: { label },
  });
  const sugar = Object.assign(Object.create(Sugar.prototype), {
    monomerItem: { label: 'R' },
    attachmentPointsToBonds: { R1: hasR1Connection ? { id: 1 } : null },
  });
  const phosphate = Object.assign(Object.create(Phosphate.prototype), {
    monomerItem: { label: 'P' },
  });

  return Object.assign(Object.create(Nucleotide.prototype), {
    rnaBase,
    sugar,
    phosphate,
    monomersCache: [],
  });
};

// A 2-position duplex, shaped exactly like the editor's right-click handler
// emits it: one NodeSelection per strand per position (4 entries for 2
// positions), each carrying the shared twoStrandedNode for its column.
const buildDuplexSelections = (): NodesSelection => {
  const sense1 = buildNucleotide('A', false);
  const antisense1 = buildNucleotide('T', false);
  const sense2 = buildNucleotide('C', true);
  const antisense2 = buildNucleotide('G', true);

  const twoStrandedNode1 = {
    senseNode: sense1,
    senseNodeIndex: 0,
    chain: {},
    antisenseNode: antisense1,
    antisenseNodeIndex: 0,
    antisenseChain: {},
  };
  const twoStrandedNode2 = {
    senseNode: sense2,
    senseNodeIndex: 1,
    chain: {},
    antisenseNode: antisense2,
    antisenseNodeIndex: 1,
    antisenseChain: {},
  };

  return [
    [
      {
        node: sense1,
        nodeIndexOverall: 0,
        hasR1Connection: false,
        twoStrandedNode: twoStrandedNode1,
      },
      {
        node: antisense1,
        nodeIndexOverall: 0,
        hasR1Connection: false,
        twoStrandedNode: twoStrandedNode1,
      },
      {
        node: sense2,
        nodeIndexOverall: 1,
        hasR1Connection: true,
        twoStrandedNode: twoStrandedNode2,
      },
      {
        node: antisense2,
        nodeIndexOverall: 1,
        hasR1Connection: true,
        twoStrandedNode: twoStrandedNode2,
      },
    ],
  ] as unknown as NodesSelection;
};

describe('SequenceItemContextMenu', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('dispatches setSequenceSelection with every selected entry when both strands of the duplex positions are selected', () => {
    setSyncEditMode(false);

    const mockEditor = {
      events: {
        layoutModeChange: { add: vi.fn(), remove: vi.fn() },
        turnOnSequenceEditInRNABuilderMode: { dispatch: vi.fn() },
      },
      isSequenceEditInRNABuilderMode: false,
      // useMonomerCreationMenu (called on every render) walks the drawing
      // entities manager to decide whether the Create/Edit monomer items
      // are available, regardless of the selection under test. Empty
      // collections keep that path inert instead of throwing.
      drawingEntitiesManager: {
        atoms: new Map(),
        bonds: new Map(),
        polymerBonds: new Map(),
        monomerToAtomBonds: new Map(),
        rxnArrows: new Map(),
        rxnPluses: new Map(),
        multitailArrows: new Map(),
        monomersArray: [],
      },
    };

    const store = configureAppStore({
      editor: {
        editor: mockEditor,
        editorLayoutMode: 'sequence-layout-mode',
        isContextMenuActive: false,
        ketcherId: 'test-ketcher-id',
      },
    } as never);

    const selections = buildDuplexSelections();
    // A function, not a cached element: rerender() must receive a freshly
    // created element tree so React actually re-invokes every component
    // instead of bailing out on referential equality of the previous
    // element graph.
    const renderTree = () => (
      <Provider store={store}>
        {withThemeProvider(
          <div className={EditorClassName}>
            <SequenceItemContextMenu selections={selections} />
          </div>,
        )}
      </Provider>
    );

    const { container, rerender } = render(renderTree());

    const portalRoot = container.querySelector(
      KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR,
    );
    expect(portalRoot).not.toBeNull();

    // SequenceItemContextMenu looks up its portal target via
    // document.querySelector during its own render, before React commits
    // the wrapping .Ketcher-polymer-editor-root div this first time around
    // - so its first pass sees no target and renders null. Force a second
    // render pass (props unchanged) now that the div is actually committed,
    // exactly as a real re-render (e.g. from the layoutModeChange listener
    // effect) would provide in the live app.
    rerender(renderTree());

    // Both the shared and the local react-contexify mocks render
    // ContextMenu's items unconditionally as plain divs instead of gating
    // them behind a show()/trigger-event flow, so the real "Modify in RNA
    // Builder..." Item is already in the DOM once SequenceItemContextMenu
    // renders; the local mock above additionally makes its onClick fire
    // with the real { id } ItemParams shape, so this click drives the real
    // handleMenuChange switch.
    const modifyInRnaBuilderItem = screen.getByTestId(
      SequenceItemContextMenuNames.modifyInRnaBuilder,
    );
    fireEvent.click(modifyInRnaBuilderItem);

    const { sequenceSelection, sequenceSelectionName } =
      store.getState().rnaBuilder;

    // 2 duplex positions with both strands selected -> all 4 entries reach
    // redux.
    expect(sequenceSelection).toHaveLength(4);
    expect(
      sequenceSelection?.map(
        (node: ketcherCore.LabeledNodesWithPositionInSequence) =>
          node.strandType,
      ),
    ).toEqual([
      STRAND_TYPE.SENSE,
      STRAND_TYPE.ANTISENSE,
      STRAND_TYPE.SENSE,
      STRAND_TYPE.ANTISENSE,
    ]);
    expect(sequenceSelectionName).toBe('4 nucleotides');
  });
});
