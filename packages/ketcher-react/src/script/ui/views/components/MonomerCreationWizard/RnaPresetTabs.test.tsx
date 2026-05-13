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

import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AttachmentPointName, KetMonomerClass } from 'ketcher-core';
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';
import { ReactNode } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Import after mocks
import { RnaPresetTabs } from './RnaPresetTabs';
import { RnaPresetWizardState } from './MonomerCreationWizard.types';

// Mock the Icon component to avoid module resolution issues
jest.mock('components', () => ({
  Icon: ({ name }: { name: string }) => <div data-testid={`icon-${name}`} />,
}));

// Mock the selectors
jest.mock('../../../state/editor/selectors', () => ({
  selectionSelector: (state) => state.editor?.selection,
  editorMonomerCreationStateSelector: (state) =>
    state.editor?.monomerCreationState,
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
  default: ({
    assignedAttachmentPoints,
    readonlyAttachmentPoints,
    attachmentPointsExtra,
  }: {
    assignedAttachmentPoints?: Map<string, [number, number]>;
    readonlyAttachmentPoints?: Array<{ name: string }>;
    attachmentPointsExtra?: ReactNode;
  }) => (
    <div data-testid="monomer-creation-wizard-fields">
      <div data-testid="attachment-points-section">Attachment points</div>
      <div data-testid="attachment-points-values">
        {[
          ...Array.from(assignedAttachmentPoints?.keys() ?? []),
          ...(readonlyAttachmentPoints?.map(({ name }) => name) ?? []),
        ].join(',')}
      </div>
      {attachmentPointsExtra}
    </div>
  ),
}));

jest.mock('./components/AttachmentPoint/AttachmentPoint', () => ({
  __esModule: true,
  default: ({ name }: { name: string }) => <div>{name}</div>,
}));

// Create a mock store
const createMockStore = (
  selection = { atoms: [], bonds: [] },
  monomerCreationState = {
    assignedAttachmentPoints: new Map(),
  },
) => {
  const reducer = combineReducers({
    editor: () => ({
      selection,
      monomerCreationState,
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
    struct: jest.fn(() => ({
      atoms: new Map(),
      bonds: new Map(),
      halfBonds: new Map(),
    })),
    reassignAttachmentPoint: jest.fn(),
    changeLeavingAtomLabel: jest.fn(),
    removeAttachmentPoint: jest.fn(),
    render: {
      ctab: {
        molecule: {
          highlights: new Map(),
        },
      },
    },
    update: jest.fn(),
    setVisibleAssignedAttachmentPoints: jest.fn(),
    setConnectionAttachmentPoints: jest.fn(),
  } as any;
};

// Helper to create initial wizard state
const createInitialWizardState = (): RnaPresetWizardState => ({
  preset: {
    name: '',
    errors: {
      name: undefined,
      phosphatePosition: undefined,
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
  let mockOnPhosphatePositionChange: jest.Mock;
  let wizardState: RnaPresetWizardState;

  beforeEach(() => {
    mockEditor = createMockEditor();
    mockStore = createMockStore();
    mockDispatch = jest.fn();
    mockOnPhosphatePositionChange = jest.fn();
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
          phosphatePosition={undefined}
          onPhosphatePositionChange={mockOnPhosphatePositionChange}
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
          phosphatePosition={undefined}
          onPhosphatePositionChange={mockOnPhosphatePositionChange}
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
          phosphatePosition={undefined}
          onPhosphatePositionChange={mockOnPhosphatePositionChange}
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
          phosphatePosition={undefined}
          onPhosphatePositionChange={mockOnPhosphatePositionChange}
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
          phosphatePosition={undefined}
          onPhosphatePositionChange={mockOnPhosphatePositionChange}
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
          phosphatePosition={undefined}
          onPhosphatePositionChange={mockOnPhosphatePositionChange}
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
          phosphatePosition={undefined}
          onPhosphatePositionChange={mockOnPhosphatePositionChange}
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
          phosphatePosition={undefined}
          onPhosphatePositionChange={mockOnPhosphatePositionChange}
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

  it('should show component-specific hints for base, sugar, and phosphate tabs', () => {
    render(
      <Provider store={mockStore}>
        <RnaPresetTabs
          wizardState={wizardState}
          editor={mockEditor}
          wizardStateDispatch={mockDispatch}
          phosphatePosition={undefined}
          onPhosphatePositionChange={mockOnPhosphatePositionChange}
        />
      </Provider>,
    );

    fireEvent.click(screen.getByTestId('nucleotide-base-tab'));
    expect(
      screen.getByText('Select all atoms that form the base.'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('nucleotide-sugar-tab'));
    expect(
      screen.getByText('Select all atoms that form the sugar.'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('nucleotide-phosphate-tab'));
    expect(
      screen.getByText('Select all atoms that form the phosphate.'),
    ).toBeInTheDocument();
  });

  it('should render phosphate position picker in phosphate tab and call selected value handler', () => {
    render(
      <Provider store={mockStore}>
        <RnaPresetTabs
          wizardState={wizardState}
          editor={mockEditor}
          wizardStateDispatch={mockDispatch}
          phosphatePosition={undefined}
          onPhosphatePositionChange={mockOnPhosphatePositionChange}
        />
      </Provider>,
    );

    fireEvent.click(screen.getByTestId('nucleotide-phosphate-tab'));

    const fieldsSection = screen.getByTestId('monomer-creation-wizard-fields');

    expect(screen.getByTestId('attachment-points-section')).toBeInTheDocument();
    expect(
      within(fieldsSection).getByTestId('phosphate-position-picker'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('phosphate-position-5-button'));

    expect(mockOnPhosphatePositionChange).toHaveBeenCalledWith('5');
  });

  it('shows only non-occupied attachment points on the preset tab', () => {
    mockStore = createMockStore(undefined, {
      assignedAttachmentPoints: new Map([
        [AttachmentPointName.R1, [1, 11]],
        [AttachmentPointName.R2, [2, 12]],
        [AttachmentPointName.R4, [4, 14]],
      ]),
    });
    wizardState.base.structure = {
      atoms: [1],
      bonds: [],
    };
    wizardState.sugar.structure = {
      atoms: [2, 4],
      bonds: [],
    };
    mockEditor.struct.mockReturnValue({
      atoms: new Map([
        [1, { neighbors: [1, 2] }],
        [2, { neighbors: [3, 4] }],
        [4, { neighbors: [5] }],
      ]),
      bonds: new Map([
        [1, { begin: 1, end: 11 }],
        [2, { begin: 2, end: 12 }],
        [3, { begin: 4, end: 14 }],
        [4, { begin: 1, end: 2 }],
      ]),
      halfBonds: new Map([
        [1, { begin: 1, end: 11 }],
        [2, { begin: 1, end: 2 }],
        [3, { begin: 2, end: 12 }],
        [4, { begin: 2, end: 1 }],
        [5, { begin: 4, end: 14 }],
      ]),
    });

    render(
      <Provider store={mockStore}>
        <RnaPresetTabs
          wizardState={wizardState}
          editor={mockEditor}
          wizardStateDispatch={mockDispatch}
          phosphatePosition={undefined}
          onPhosphatePositionChange={mockOnPhosphatePositionChange}
        />
      </Provider>,
    );

    expect(
      screen.getByTestId('attachment-point-info-icon'),
    ).toBeInTheDocument();
    expect(screen.queryByText('R1')).not.toBeInTheDocument();
    expect(screen.queryByText('R2')).not.toBeInTheDocument();
    expect(screen.getByText('R4')).toBeInTheDocument();
  });

  it('passes all component attachment points to the selected component tab', () => {
    mockStore = createMockStore(undefined, {
      assignedAttachmentPoints: new Map([
        [AttachmentPointName.R1, [1, 11]],
        [AttachmentPointName.R2, [2, 12]],
        [AttachmentPointName.R3, [3, 13]],
      ]),
    });
    wizardState.base.structure = {
      atoms: [1, 3],
      bonds: [],
    };
    wizardState.sugar.structure = {
      atoms: [2],
      bonds: [],
    };

    render(
      <Provider store={mockStore}>
        <RnaPresetTabs
          wizardState={wizardState}
          editor={mockEditor}
          wizardStateDispatch={mockDispatch}
          phosphatePosition={undefined}
          onPhosphatePositionChange={mockOnPhosphatePositionChange}
        />
      </Provider>,
    );

    fireEvent.click(screen.getByTestId('nucleotide-base-tab'));

    expect(screen.getByTestId('attachment-points-values')).toHaveTextContent(
      'R1,R3',
    );
  });

  it('shows sugar/base connection attachment points on the corresponding component tabs', () => {
    wizardState.base.structure = {
      atoms: [1],
      bonds: [],
    };
    wizardState.sugar.structure = {
      atoms: [2],
      bonds: [],
    };
    mockEditor.struct.mockReturnValue({
      atoms: new Map(),
      bonds: new Map([[1, { begin: 1, end: 2 }]]),
      halfBonds: new Map(),
    });

    render(
      <Provider store={mockStore}>
        <RnaPresetTabs
          wizardState={wizardState}
          editor={mockEditor}
          wizardStateDispatch={mockDispatch}
          phosphatePosition={undefined}
          onPhosphatePositionChange={mockOnPhosphatePositionChange}
        />
      </Provider>,
    );

    fireEvent.click(screen.getByTestId('nucleotide-sugar-tab'));
    expect(screen.getByTestId('attachment-points-values')).toHaveTextContent(
      'R3',
    );

    fireEvent.click(screen.getByTestId('nucleotide-base-tab'));
    expect(screen.getByTestId('attachment-points-values')).toHaveTextContent(
      'R1',
    );
  });

  it.each<{
    phosphatePosition: '3' | '5';
    expectedSugar: string;
    expectedPhosphate: string;
  }>([
    {
      phosphatePosition: '3',
      expectedSugar: 'R2',
      expectedPhosphate: 'R1',
    },
    {
      phosphatePosition: '5',
      expectedSugar: 'R1',
      expectedPhosphate: 'R2',
    },
  ])(
    "shows sugar/phosphate connection attachment points based on $phosphatePosition' phosphate position",
    ({ phosphatePosition, expectedSugar, expectedPhosphate }) => {
      wizardState.sugar.structure = {
        atoms: [2],
        bonds: [],
      };
      wizardState.phosphate.structure = {
        atoms: [3],
        bonds: [],
      };
      mockEditor.struct.mockReturnValue({
        atoms: new Map(),
        bonds: new Map([[1, { begin: 2, end: 3 }]]),
        halfBonds: new Map(),
      });

      render(
        <Provider store={mockStore}>
          <RnaPresetTabs
            wizardState={wizardState}
            editor={mockEditor}
            wizardStateDispatch={mockDispatch}
            phosphatePosition={phosphatePosition}
            onPhosphatePositionChange={mockOnPhosphatePositionChange}
          />
        </Provider>,
      );

      fireEvent.click(screen.getByTestId('nucleotide-sugar-tab'));
      expect(screen.getByTestId('attachment-points-values')).toHaveTextContent(
        expectedSugar,
      );

      fireEvent.click(screen.getByTestId('nucleotide-phosphate-tab'));
      expect(screen.getByTestId('attachment-points-values')).toHaveTextContent(
        expectedPhosphate,
      );
    },
  );

  it('recalculates sugar/phosphate connection attachment points when phosphate position changes', () => {
    wizardState.sugar.structure = {
      atoms: [2],
      bonds: [],
    };
    wizardState.phosphate.structure = {
      atoms: [3],
      bonds: [],
    };
    mockEditor.struct.mockReturnValue({
      atoms: new Map(),
      bonds: new Map([[1, { begin: 2, end: 3 }]]),
      halfBonds: new Map(),
    });

    const { rerender } = render(
      <Provider store={mockStore}>
        <RnaPresetTabs
          wizardState={wizardState}
          editor={mockEditor}
          wizardStateDispatch={mockDispatch}
          phosphatePosition="3"
          onPhosphatePositionChange={mockOnPhosphatePositionChange}
        />
      </Provider>,
    );

    fireEvent.click(screen.getByTestId('nucleotide-sugar-tab'));
    expect(screen.getByTestId('attachment-points-values')).toHaveTextContent(
      'R2',
    );

    rerender(
      <Provider store={mockStore}>
        <RnaPresetTabs
          wizardState={wizardState}
          editor={mockEditor}
          wizardStateDispatch={mockDispatch}
          phosphatePosition="5"
          onPhosphatePositionChange={mockOnPhosphatePositionChange}
        />
      </Provider>,
    );

    expect(screen.getByTestId('attachment-points-values')).toHaveTextContent(
      'R1',
    );

    fireEvent.click(screen.getByTestId('nucleotide-phosphate-tab'));
    expect(screen.getByTestId('attachment-points-values')).toHaveTextContent(
      'R2',
    );
  });

  it('shows both explicit and connection attachment points when they share the same label', () => {
    mockStore = createMockStore(undefined, {
      assignedAttachmentPoints: new Map([
        [AttachmentPointName.R2, [2, 12]],
        [AttachmentPointName.R1, [3, 13]],
      ]),
    });
    wizardState.sugar.structure = {
      atoms: [2],
      bonds: [],
    };
    wizardState.phosphate.structure = {
      atoms: [3],
      bonds: [],
    };
    mockEditor.struct.mockReturnValue({
      atoms: new Map(),
      bonds: new Map([[1, { begin: 2, end: 3 }]]),
      halfBonds: new Map(),
    });

    render(
      <Provider store={mockStore}>
        <RnaPresetTabs
          wizardState={wizardState}
          editor={mockEditor}
          wizardStateDispatch={mockDispatch}
          phosphatePosition="3"
          onPhosphatePositionChange={mockOnPhosphatePositionChange}
        />
      </Provider>,
    );

    fireEvent.click(screen.getByTestId('nucleotide-sugar-tab'));
    expect(screen.getByTestId('attachment-points-values')).toHaveTextContent(
      'R2,R2',
    );

    fireEvent.click(screen.getByTestId('nucleotide-phosphate-tab'));
    expect(screen.getByTestId('attachment-points-values')).toHaveTextContent(
      'R1,R1',
    );
  });

  it('keeps connection attachment points hidden on the preset tab', () => {
    mockStore = createMockStore(undefined, {
      assignedAttachmentPoints: new Map([
        [AttachmentPointName.R1, [1, 11]],
        [AttachmentPointName.R3, [2, 12]],
      ]),
    });
    wizardState.base.structure = {
      atoms: [1],
      bonds: [],
    };
    wizardState.sugar.structure = {
      atoms: [2],
      bonds: [],
    };
    mockEditor.struct.mockReturnValue({
      atoms: new Map([
        [1, { neighbors: [1, 2] }],
        [2, { neighbors: [3, 4] }],
      ]),
      bonds: new Map([[1, { begin: 1, end: 2 }]]),
      halfBonds: new Map([
        [1, { begin: 1, end: 11 }],
        [2, { begin: 1, end: 2 }],
        [3, { begin: 2, end: 12 }],
        [4, { begin: 2, end: 1 }],
      ]),
    });

    render(
      <Provider store={mockStore}>
        <RnaPresetTabs
          wizardState={wizardState}
          editor={mockEditor}
          wizardStateDispatch={mockDispatch}
          phosphatePosition={undefined}
          onPhosphatePositionChange={mockOnPhosphatePositionChange}
        />
      </Provider>,
    );

    expect(screen.queryByText('R1')).not.toBeInTheDocument();
    expect(screen.queryByText('R3')).not.toBeInTheDocument();
  });
});
