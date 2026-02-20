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

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Import after mocks
import { RnaPresetTabs } from './RnaPresetTabs';
import { RnaPresetWizardState } from './MonomerCreationWizard.types';
import { KetMonomerClass } from 'ketcher-core';

// Mock the Icon component to avoid module resolution issues
jest.mock('components', () => ({
  Icon: ({ name }: { name: string }) => <div data-testid={`icon-${name}`} />,
}));

// Mock the selectors
jest.mock('../../../state/editor/selectors', () => ({
  selectionSelector: jest.fn(),
}));

// Mock useAppContext
jest.mock('../../../../../hooks', () => ({
  useAppContext: () => ({
    ketcherId: 'test-ketcher-id',
  }),
}));

// Mock MonomerCreationWizardFields to avoid additional dependencies
jest.mock('./MonomerCreationWizardFields', () => ({
  __esModule: true,
  default: () => <div data-testid="monomer-creation-wizard-fields" />,
}));

// Create a mock store
const createMockStore = (selection = { atoms: [], bonds: [] }) => {
  const reducer = combineReducers({
    editor: () => ({
      selection,
    }),
  });
  return createStore(reducer);
};

// Mock Editor with highlights API
const createMockEditor = () => {
  const highlightsMock = {
    clear: jest.fn(),
    create: jest.fn(),
    getAll: jest.fn(() => []),
  };

  return {
    highlights: highlightsMock,
    selection: jest.fn(),
    render: {
      ctab: {
        molecule: {
          highlights: new Map(),
        },
      },
    },
    update: jest.fn(),
  } as any;
};

// Helper to create initial wizard state
const createInitialWizardState = (): RnaPresetWizardState => ({
  preset: {
    name: '',
    errors: {
      name: undefined,
    },
    notifications: new Map(),
    manuallyModifiedSymbols: {
      base: false,
      sugar: false,
      phosphate: false,
    },
  },
  base: {
    values: {
      type: KetMonomerClass.Base,
      symbol: '',
      name: '',
      naturalAnalogue: '',
      aliasHELM: '',
    },
    errors: {},
    notifications: new Map(),
    structure: undefined,
  },
  sugar: {
    values: {
      type: KetMonomerClass.Sugar,
      symbol: '',
      name: '',
      naturalAnalogue: '',
      aliasHELM: '',
    },
    errors: {},
    notifications: new Map(),
    structure: undefined,
  },
  phosphate: {
    values: {
      type: KetMonomerClass.Phosphate,
      symbol: '',
      name: '',
      naturalAnalogue: '',
      aliasHELM: '',
    },
    errors: {},
    notifications: new Map(),
    structure: undefined,
  },
});

describe('RnaPresetTabs - applyHighlights function', () => {
  let mockEditor: ReturnType<typeof createMockEditor>;
  let mockStore: ReturnType<typeof createMockStore>;
  let mockDispatch: jest.Mock;
  let wizardState: RnaPresetWizardState;

  beforeEach(() => {
    mockEditor = createMockEditor();
    mockStore = createMockStore();
    mockDispatch = jest.fn();
    wizardState = createInitialWizardState();
    jest.clearAllMocks();
  });

  it('should clear existing highlights when structure exists and tab is clicked', () => {
    wizardState.base.structure = {
      atoms: [1, 2, 3],
      bonds: [1, 2],
    };

    render(
      <Provider store={mockStore}>
        <RnaPresetTabs
          wizardState={wizardState}
          editor={mockEditor}
          wizardStateDispatch={mockDispatch}
        />
      </Provider>,
    );

    // Click on the Base tab to trigger applyHighlights
    const baseTab = screen.getByTestId('nucleotide-base-tab');
    fireEvent.click(baseTab);

    expect(mockEditor.highlights.clear).toHaveBeenCalled();
  });

  it('should not create highlights when highlightEnabled is false', () => {
    wizardState.base.structure = {
      atoms: [1, 2, 3],
      bonds: [1, 2],
    };

    render(
      <Provider store={mockStore}>
        <RnaPresetTabs
          wizardState={wizardState}
          editor={mockEditor}
          wizardStateDispatch={mockDispatch}
        />
      </Provider>,
    );

    // Clear the initial calls
    mockEditor.highlights.clear.mockClear();
    mockEditor.highlights.create.mockClear();

    // Click the highlight checkbox to disable it
    const highlightCheckbox = screen.getByRole('checkbox');
    fireEvent.click(highlightCheckbox);

    // Should clear but not create new highlights
    expect(mockEditor.highlights.clear).toHaveBeenCalled();
    expect(mockEditor.highlights.create).not.toHaveBeenCalled();
  });

  it('should apply active highlight color to the active tab component', () => {
    const ACTIVE_HIGHLIGHT_COLOR = '#CDF1FC';
    wizardState.base.structure = {
      atoms: [1, 2, 3],
      bonds: [1, 2],
    };

    render(
      <Provider store={mockStore}>
        <RnaPresetTabs
          wizardState={wizardState}
          editor={mockEditor}
          wizardStateDispatch={mockDispatch}
        />
      </Provider>,
    );

    // Click on the Base tab (index 1)
    const baseTab = screen.getByTestId('nucleotide-base-tab');
    fireEvent.click(baseTab);

    // Should create highlight with active color for base
    expect(mockEditor.highlights.create).toHaveBeenCalledWith(
      expect.objectContaining({
        atoms: [1, 2, 3],
        bonds: [1, 2],
        color: ACTIVE_HIGHLIGHT_COLOR,
      }),
    );
  });

  it('should apply inactive highlight color to inactive tab components', () => {
    const ACTIVE_HIGHLIGHT_COLOR = '#CDF1FC';
    const INACTIVE_HIGHLIGHT_COLOR = '#EFF2F5';

    wizardState.base.structure = {
      atoms: [1, 2, 3],
      bonds: [1, 2],
    };
    wizardState.sugar.structure = {
      atoms: [4, 5, 6],
      bonds: [3, 4],
    };

    render(
      <Provider store={mockStore}>
        <RnaPresetTabs
          wizardState={wizardState}
          editor={mockEditor}
          wizardStateDispatch={mockDispatch}
        />
      </Provider>,
    );

    // Click on the Base tab (index 1)
    const baseTab = screen.getByTestId('nucleotide-base-tab');
    fireEvent.click(baseTab);

    // The create function is called once for each component in the forEach loop
    // Each call has one highlight object
    expect(mockEditor.highlights.create).toHaveBeenCalled();

    const createCalls = mockEditor.highlights.create.mock.calls;

    // Flatten all calls to get all highlight objects
    const allHighlights = createCalls.flat();

    const baseHighlight = allHighlights.find((h: any) => h.atoms?.includes(1));
    const sugarHighlight = allHighlights.find((h: any) => h.atoms?.includes(4));

    expect(baseHighlight).toMatchObject({
      atoms: [1, 2, 3],
      bonds: [1, 2],
      color: ACTIVE_HIGHLIGHT_COLOR,
    });

    expect(sugarHighlight).toMatchObject({
      atoms: [4, 5, 6],
      bonds: [3, 4],
      color: INACTIVE_HIGHLIGHT_COLOR,
    });
  });

  it('should handle multiple components with correct colors', () => {
    const ACTIVE_HIGHLIGHT_COLOR = '#CDF1FC';
    const INACTIVE_HIGHLIGHT_COLOR = '#EFF2F5';

    wizardState.base.structure = {
      atoms: [1, 2, 3],
      bonds: [1, 2],
    };
    wizardState.sugar.structure = {
      atoms: [4, 5, 6],
      bonds: [3, 4],
    };
    wizardState.phosphate.structure = {
      atoms: [7, 8, 9],
      bonds: [5, 6],
    };

    render(
      <Provider store={mockStore}>
        <RnaPresetTabs
          wizardState={wizardState}
          editor={mockEditor}
          wizardStateDispatch={mockDispatch}
        />
      </Provider>,
    );

    // Click on the Sugar tab (index 2)
    const sugarTab = screen.getByTestId('nucleotide-sugar-tab');
    fireEvent.click(sugarTab);

    // Get all create calls and flatten
    const createCalls = mockEditor.highlights.create.mock.calls;
    const allHighlights = createCalls.flat();

    const baseHighlight = allHighlights.find((h: any) => h.atoms?.includes(1));
    const sugarHighlight = allHighlights.find((h: any) => h.atoms?.includes(4));
    const phosphateHighlight = allHighlights.find((h: any) =>
      h.atoms?.includes(7),
    );

    // Base should have inactive color
    expect(baseHighlight).toMatchObject({
      atoms: [1, 2, 3],
      color: INACTIVE_HIGHLIGHT_COLOR,
    });

    // Sugar should have active color
    expect(sugarHighlight).toMatchObject({
      atoms: [4, 5, 6],
      color: ACTIVE_HIGHLIGHT_COLOR,
    });

    // Phosphate should have inactive color
    expect(phosphateHighlight).toMatchObject({
      atoms: [7, 8, 9],
      color: INACTIVE_HIGHLIGHT_COLOR,
    });
  });

  it('should skip components without structure', () => {
    wizardState.base.structure = {
      atoms: [1, 2, 3],
      bonds: [1, 2],
    };
    // sugar and phosphate have no structure

    render(
      <Provider store={mockStore}>
        <RnaPresetTabs
          wizardState={wizardState}
          editor={mockEditor}
          wizardStateDispatch={mockDispatch}
        />
      </Provider>,
    );

    // Click on the Base tab
    const baseTab = screen.getByTestId('nucleotide-base-tab');
    fireEvent.click(baseTab);

    // Get the last call to create
    const createCalls = mockEditor.highlights.create.mock.calls;
    const lastCall = createCalls[createCalls.length - 1];

    // Should only have one highlight (for base)
    expect(lastCall.length).toBe(1);
    expect(lastCall[0]).toMatchObject({
      atoms: [1, 2, 3],
      bonds: [1, 2],
    });
  });

  it('should update highlights when switching between tabs', () => {
    const ACTIVE_HIGHLIGHT_COLOR = '#CDF1FC';
    const INACTIVE_HIGHLIGHT_COLOR = '#EFF2F5';

    wizardState.base.structure = {
      atoms: [1, 2, 3],
      bonds: [1, 2],
    };
    wizardState.sugar.structure = {
      atoms: [4, 5, 6],
      bonds: [3, 4],
    };

    render(
      <Provider store={mockStore}>
        <RnaPresetTabs
          wizardState={wizardState}
          editor={mockEditor}
          wizardStateDispatch={mockDispatch}
        />
      </Provider>,
    );

    // Click on Base tab
    const baseTab = screen.getByTestId('nucleotide-base-tab');
    fireEvent.click(baseTab);

    let createCalls = mockEditor.highlights.create.mock.calls;
    let allHighlights = createCalls.flat();

    let baseHighlight = allHighlights.find((h: any) => h.atoms?.includes(1));
    let sugarHighlight = allHighlights.find((h: any) => h.atoms?.includes(4));

    // Base should be active
    expect(baseHighlight).toBeDefined();
    expect(sugarHighlight).toBeDefined();
    expect(baseHighlight.color).toBe(ACTIVE_HIGHLIGHT_COLOR);
    expect(sugarHighlight.color).toBe(INACTIVE_HIGHLIGHT_COLOR);

    // Clear the mock to start fresh
    mockEditor.highlights.create.mockClear();

    // Click on Sugar tab
    const sugarTab = screen.getByTestId('nucleotide-sugar-tab');
    fireEvent.click(sugarTab);

    createCalls = mockEditor.highlights.create.mock.calls;
    allHighlights = createCalls.flat();

    baseHighlight = allHighlights.find((h: any) => h.atoms?.includes(1));
    sugarHighlight = allHighlights.find((h: any) => h.atoms?.includes(4));

    // Now sugar should be active and base should be inactive
    expect(sugarHighlight).toBeDefined();
    expect(baseHighlight).toBeDefined();
    expect(sugarHighlight.color).toBe(ACTIVE_HIGHLIGHT_COLOR);
    expect(baseHighlight.color).toBe(INACTIVE_HIGHLIGHT_COLOR);
  });

  it('should clear highlights but not create new ones when tab has no structure', () => {
    // All components have no structure
    render(
      <Provider store={mockStore}>
        <RnaPresetTabs
          wizardState={wizardState}
          editor={mockEditor}
          wizardStateDispatch={mockDispatch}
        />
      </Provider>,
    );

    // Click on Base tab (which has no structure)
    const baseTab = screen.getByTestId('nucleotide-base-tab');
    fireEvent.click(baseTab);

    // When clicking a tab, handleChange calls applyHighlights which clears highlights
    expect(mockEditor.highlights.clear).toHaveBeenCalled();
    // But since there's no structure, no highlights should be created
    expect(mockEditor.highlights.create).not.toHaveBeenCalled();
  });
});
