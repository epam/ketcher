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

import { render, screen } from '@testing-library/react';
import { TopToolbar } from './TopToolbar';

const useResizeObserverMock = jest.fn();

jest.mock('src/hooks', () => ({
  useAppContext: () => ({ ketcherId: 'test-ketcher-id' }),
  useResizeObserver: () => useResizeObserverMock(),
}));

jest.mock('ketcher-core', () => ({
  ketcherProvider: {
    getKetcher: () => ({ sendCustomAction: jest.fn() }),
  },
}));

jest.mock('./FileControls', () => ({ FileControls: () => null }));
jest.mock('./ClipboardControls', () => ({ ClipboardControls: () => null }));
jest.mock('./UndoRedo', () => ({ UndoRedo: () => null }));
jest.mock('./ZoomControls', () => ({ ZoomControls: () => null }));
jest.mock('./SystemControls', () => ({ SystemControls: () => null }));
jest.mock('./Divider', () => ({ Divider: () => null }));
jest.mock('./TopToolbarIconButton', () => ({
  TopToolbarIconButton: () => null,
}));

jest.mock('./ExternalFuncControls', () => ({
  ExternalFuncControls: ({ isCollapsed }: { isCollapsed: boolean }) => (
    <div data-testid="external-func-controls" data-collapsed={isCollapsed} />
  ),
}));

jest.mock('./CustomButtons', () => ({
  CustomButtons: ({ isCollapsed }: { isCollapsed: boolean }) => (
    <div data-testid="custom-buttons" data-collapsed={isCollapsed} />
  ),
}));

// Issue: epam/ketcher#6154 - customButtons collapsed into the overflow
// submenu even though enough space was available once a standard button
// was hidden, because the collapse threshold never accounted for the
// space that hidden standard buttons free up.
describe('TopToolbar collapse threshold', () => {
  const defaultProps = {
    className: '',
    disabledButtons: [],
    indigoVerification: false,
    shortcuts: {},
    onClear: jest.fn(),
    onFileOpen: jest.fn(),
    onSave: jest.fn(),
    onUndo: jest.fn(),
    onRedo: jest.fn(),
    onCopy: jest.fn(),
    onCopyMol: jest.fn(),
    onCopyKet: jest.fn(),
    onCopyImage: jest.fn(),
    onCut: jest.fn(),
    onPaste: jest.fn(),
    currentZoom: 100,
    onZoom: jest.fn(),
    onZoomIn: jest.fn(),
    onZoomOut: jest.fn(),
    onSettingsOpen: jest.fn(),
    onLayout: jest.fn(),
    onClean: jest.fn(),
    onAromatize: jest.fn(),
    onDearomatize: jest.fn(),
    onCalculate: jest.fn(),
    onCheck: jest.fn(),
    onAnalyse: jest.fn(),
    onMiew: jest.fn(),
    onToggleExplicitHydrogens: jest.fn(),
    onFullscreen: jest.fn(),
    onAbout: jest.fn(),
    onHelp: jest.fn(),
    isModeSwitcherDisabled: false,
  };

  const isCollapsedFor = () => {
    const externalFunc = screen.getByTestId('external-func-controls');
    const customButtons = screen.getByTestId('custom-buttons');
    return {
      externalFunc: externalFunc.getAttribute('data-collapsed'),
      customButtons: customButtons.getAttribute('data-collapsed'),
    };
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('collapses at the baseline threshold (650 + 40px per custom button) when nothing is hidden', () => {
    useResizeObserverMock.mockReturnValue({ ref: jest.fn(), width: 729 });

    render(
      <TopToolbar
        {...defaultProps}
        hiddenButtons={[]}
        customButtons={[
          { id: 'test1', title: 'test1', imageLink: 'link1' },
          { id: 'test2', title: 'test2', imageLink: 'link2' },
        ]}
      />,
    );

    expect(isCollapsedFor()).toEqual({
      externalFunc: 'true',
      customButtons: 'true',
    });
  });

  it('does not collapse once width reaches the baseline threshold', () => {
    useResizeObserverMock.mockReturnValue({ ref: jest.fn(), width: 730 });

    render(
      <TopToolbar
        {...defaultProps}
        hiddenButtons={[]}
        customButtons={[
          { id: 'test1', title: 'test1', imageLink: 'link1' },
          { id: 'test2', title: 'test2', imageLink: 'link2' },
        ]}
      />,
    );

    expect(isCollapsedFor()).toEqual({
      externalFunc: 'false',
      customButtons: 'false',
    });
  });

  it('lowers the threshold by 40px per hidden standard button, freeing up room for custom buttons', () => {
    useResizeObserverMock.mockReturnValue({ ref: jest.fn(), width: 700 });

    render(
      <TopToolbar
        {...defaultProps}
        hiddenButtons={['fullscreen']}
        customButtons={[
          { id: 'test1', title: 'test1', imageLink: 'link1' },
          { id: 'test2', title: 'test2', imageLink: 'link2' },
        ]}
      />,
    );

    // Baseline threshold would be 730 (650 + 2*40) and would still collapse
    // at width 700; hiding one standard button drops it to 690, so 700
    // should no longer be collapsed.
    expect(isCollapsedFor()).toEqual({
      externalFunc: 'false',
      customButtons: 'false',
    });
  });

  it('ignores hidden button names that are not part of the top toolbar', () => {
    useResizeObserverMock.mockReturnValue({ ref: jest.fn(), width: 700 });

    render(
      <TopToolbar
        {...defaultProps}
        hiddenButtons={['sgroup']}
        customButtons={[
          { id: 'test1', title: 'test1', imageLink: 'link1' },
          { id: 'test2', title: 'test2', imageLink: 'link2' },
        ]}
      />,
    );

    // 'sgroup' is a left/right toolbar button, not one of the top toolbar
    // buttons accounted for in the threshold, so it must not shift it.
    expect(isCollapsedFor()).toEqual({
      externalFunc: 'true',
      customButtons: 'true',
    });
  });

  it('never lowers the threshold below zero when many standard buttons are hidden', () => {
    useResizeObserverMock.mockReturnValue({ ref: jest.fn(), width: 1 });

    render(
      <TopToolbar
        {...defaultProps}
        hiddenButtons={[
          'clear',
          'open',
          'save',
          'copy',
          'copy-mol',
          'copy-ket',
          'copy-image',
          'paste',
          'cut',
          'undo',
          'redo',
          'arom',
          'dearom',
          'layout',
          'clean',
          'cip',
          'check',
          'analyse',
          'explicit-hydrogens',
          'miew',
          'settings',
          'help',
          'about',
          'fullscreen',
          'zoom-list',
        ]}
        customButtons={[]}
      />,
    );

    expect(isCollapsedFor()).toEqual({
      externalFunc: 'false',
      customButtons: 'false',
    });
  });
});
