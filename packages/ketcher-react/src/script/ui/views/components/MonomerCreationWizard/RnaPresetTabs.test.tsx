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
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { RnaPresetTabs } from './RnaPresetTabs';
import { RnaPresetWizardState } from './MonomerCreationWizard.types';

// Mock react-redux
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

// Mock the Editor
const mockHighlightsClear = jest.fn();
const mockHighlightsCreate = jest.fn();
const mockEditorSelection = jest.fn();

const mockEditor = {
  highlights: {
    clear: mockHighlightsClear,
    create: mockHighlightsCreate,
  },
  selection: mockEditorSelection,
} as any;

// Mock MonomerCreationWizardFields component
jest.mock('./MonomerCreationWizardFields', () => {
  return function MockMonomerCreationWizardFields() {
    return <div data-testid="mock-wizard-fields">Wizard Fields</div>;
  };
});

// Mock AttributeField component
jest.mock('./components/AttributeField/AttributeField', () => {
  return function MockAttributeField({ control }: any) {
    return <div data-testid="mock-attribute-field">{control}</div>;
  };
});

// Mock Icon component
jest.mock('components', () => ({
  Icon: ({ name }: { name: string }) => <div data-testid={`icon-${name}`} />,
}));

describe('RnaPresetTabs - Highlight Toggle Feature', () => {
  const mockWizardStateDispatch = jest.fn();

  // Test data constants
  const ACTIVE_HIGHLIGHT_COLOR = '#CDF1FC';
  const INACTIVE_HIGHLIGHT_COLOR = '#EFF2F5';
  const BASE_ATOMS = [1, 2];
  const BASE_BONDS = [1];
  const SUGAR_ATOMS = [3, 4];
  const SUGAR_BONDS = [2];
  const PHOSPHATE_ATOMS = [5, 6];
  const PHOSPHATE_BONDS = [3];
  const EMPTY_RGROUP_ATTACHMENT_POINTS: never[] = [];

  const createMockWizardState = (
    withStructures = false,
  ): RnaPresetWizardState => ({
    preset: {
      name: '',
      errors: {},
      notifications: new Map(),
      manuallyModifiedSymbols: {
        base: false,
        sugar: false,
        phosphate: false,
      },
    },
    base: {
      values: {
        type: 'Base' as any,
        symbol: '',
        name: '',
        naturalAnalogue: '',
        aliasHELM: '',
      },
      errors: {},
      notifications: new Map(),
      structure: withStructures
        ? { atoms: BASE_ATOMS, bonds: BASE_BONDS }
        : undefined,
    } as any,
    sugar: {
      values: {
        type: 'Sugar' as any,
        symbol: '',
        name: '',
        naturalAnalogue: '',
        aliasHELM: '',
      },
      errors: {},
      notifications: new Map(),
      structure: withStructures
        ? { atoms: SUGAR_ATOMS, bonds: SUGAR_BONDS }
        : undefined,
    } as any,
    phosphate: {
      values: {
        type: 'Phosphate' as any,
        symbol: '',
        name: '',
        naturalAnalogue: '',
        aliasHELM: '',
      },
      errors: {},
      notifications: new Map(),
      structure: withStructures
        ? { atoms: PHOSPHATE_ATOMS, bonds: PHOSPHATE_BONDS }
        : undefined,
    } as any,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock useSelector to return empty selection
    const { useSelector } = require('react-redux');
    useSelector.mockReturnValue({ atoms: [] });
  });

  describe('Highlight checkbox rendering', () => {
    it('should render highlight checkbox with default checked state', () => {
      const wizardState = createMockWizardState();
      render(
        <RnaPresetTabs
          wizardState={wizardState}
          editor={mockEditor}
          wizardStateDispatch={mockWizardStateDispatch}
        />,
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toBeChecked();
      expect(screen.getByText('Highlight')).toBeInTheDocument();
    });

    it('should render highlight checkbox label', () => {
      const wizardState = createMockWizardState();
      render(
        <RnaPresetTabs
          wizardState={wizardState}
          editor={mockEditor}
          wizardStateDispatch={mockWizardStateDispatch}
        />,
      );

      expect(screen.getByText('Highlight')).toBeInTheDocument();
    });
  });

  describe('handleHighlightToggle function', () => {
    it('should toggle checkbox state when clicked', async () => {
      const user = userEvent.setup();
      const wizardState = createMockWizardState(true);

      render(
        <RnaPresetTabs
          wizardState={wizardState}
          editor={mockEditor}
          wizardStateDispatch={mockWizardStateDispatch}
        />,
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();

      // Click to uncheck
      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();

      // Click to check again
      await user.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it('should call handleHighlightToggle on checkbox change', () => {
      const wizardState = createMockWizardState(true);

      render(
        <RnaPresetTabs
          wizardState={wizardState}
          editor={mockEditor}
          wizardStateDispatch={mockWizardStateDispatch}
        />,
      );

      const checkbox = screen.getByRole('checkbox');

      // Clear previous calls from initial render
      mockHighlightsClear.mockClear();
      mockHighlightsCreate.mockClear();

      fireEvent.click(checkbox);

      // Should clear highlights and not create new ones when disabled
      expect(mockHighlightsClear).toHaveBeenCalled();
    });
  });

  describe('Highlights application when toggle is enabled', () => {
    it('should apply highlights on initial render when structures exist', () => {
      const wizardState = createMockWizardState(true);

      render(
        <RnaPresetTabs
          wizardState={wizardState}
          editor={mockEditor}
          wizardStateDispatch={mockWizardStateDispatch}
        />,
      );

      // Should not create highlights initially on preset tab (tab 0)
      // because there's no structure for preset tab
      // (clear may or may not be called depending on effects)
      expect(mockHighlightsCreate).not.toHaveBeenCalled();
    });

    it('should apply highlights with correct colors when switching to base tab', async () => {
      const user = userEvent.setup();
      const wizardState = createMockWizardState(true);

      render(
        <RnaPresetTabs
          wizardState={wizardState}
          editor={mockEditor}
          wizardStateDispatch={mockWizardStateDispatch}
        />,
      );

      mockHighlightsClear.mockClear();
      mockHighlightsCreate.mockClear();

      // Switch to Base tab (index 1)
      const baseTab = screen.getByTestId('nucleotide-base-tab');
      await user.click(baseTab);

      // Should clear highlights first
      expect(mockHighlightsClear).toHaveBeenCalled();

      // Should create highlights for all three components (may be called multiple times due to effects)
      expect(mockHighlightsCreate).toHaveBeenCalled();

      // Base should have active color (tab index 1)
      expect(mockHighlightsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          atoms: BASE_ATOMS,
          bonds: BASE_BONDS,
          rgroupAttachmentPoints: EMPTY_RGROUP_ATTACHMENT_POINTS,
          color: ACTIVE_HIGHLIGHT_COLOR, // ACTIVE_HIGHLIGHT_COLOR
        }),
      );

      // Sugar should have inactive color
      expect(mockHighlightsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          atoms: SUGAR_ATOMS,
          bonds: SUGAR_BONDS,
          rgroupAttachmentPoints: EMPTY_RGROUP_ATTACHMENT_POINTS,
          color: INACTIVE_HIGHLIGHT_COLOR, // INACTIVE_HIGHLIGHT_COLOR
        }),
      );

      // Phosphate should have inactive color
      expect(mockHighlightsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          bonds: PHOSPHATE_BONDS,
          atoms: PHOSPHATE_ATOMS,
          rgroupAttachmentPoints: EMPTY_RGROUP_ATTACHMENT_POINTS,
          color: INACTIVE_HIGHLIGHT_COLOR, // INACTIVE_HIGHLIGHT_COLOR
        }),
      );
    });

    it('should apply highlights with correct colors when switching to sugar tab', async () => {
      const user = userEvent.setup();
      const wizardState = createMockWizardState(true);

      render(
        <RnaPresetTabs
          wizardState={wizardState}
          editor={mockEditor}
          wizardStateDispatch={mockWizardStateDispatch}
        />,
      );

      mockHighlightsClear.mockClear();
      mockHighlightsCreate.mockClear();

      // Switch to Sugar tab (index 2)
      const sugarTab = screen.getByTestId('nucleotide-sugar-tab');
      await user.click(sugarTab);

      // Should clear highlights first
      expect(mockHighlightsClear).toHaveBeenCalled();

      // Should create highlights for all three components (may be called multiple times due to effects)
      expect(mockHighlightsCreate).toHaveBeenCalled();

      // Base should have inactive color
      expect(mockHighlightsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          atoms: BASE_ATOMS,
          bonds: BASE_BONDS,
          rgroupAttachmentPoints: EMPTY_RGROUP_ATTACHMENT_POINTS,
          color: INACTIVE_HIGHLIGHT_COLOR, // INACTIVE_HIGHLIGHT_COLOR
        }),
      );

      // Sugar should have active color (tab index 2)
      expect(mockHighlightsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          atoms: SUGAR_ATOMS,
          bonds: SUGAR_BONDS,
          rgroupAttachmentPoints: EMPTY_RGROUP_ATTACHMENT_POINTS,
          color: ACTIVE_HIGHLIGHT_COLOR, // ACTIVE_HIGHLIGHT_COLOR
        }),
      );

      // Phosphate should have inactive color
      expect(mockHighlightsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          bonds: PHOSPHATE_BONDS,
          atoms: PHOSPHATE_ATOMS,
          rgroupAttachmentPoints: EMPTY_RGROUP_ATTACHMENT_POINTS,
          color: INACTIVE_HIGHLIGHT_COLOR, // INACTIVE_HIGHLIGHT_COLOR
        }),
      );
    });

    it('should apply highlights with correct colors when switching to phosphate tab', async () => {
      const user = userEvent.setup();
      const wizardState = createMockWizardState(true);

      render(
        <RnaPresetTabs
          wizardState={wizardState}
          editor={mockEditor}
          wizardStateDispatch={mockWizardStateDispatch}
        />,
      );

      mockHighlightsClear.mockClear();
      mockHighlightsCreate.mockClear();

      // Switch to Phosphate tab (index 3)
      const phosphateTab = screen.getByTestId('nucleotide-phosphate-tab');
      await user.click(phosphateTab);

      // Should clear highlights first
      expect(mockHighlightsClear).toHaveBeenCalled();

      // Should create highlights for all three components (may be called multiple times due to effects)
      expect(mockHighlightsCreate).toHaveBeenCalled();

      // Phosphate should have active color (tab index 3)
      expect(mockHighlightsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          bonds: PHOSPHATE_BONDS,
          atoms: PHOSPHATE_ATOMS,
          rgroupAttachmentPoints: EMPTY_RGROUP_ATTACHMENT_POINTS,
          color: ACTIVE_HIGHLIGHT_COLOR, // ACTIVE_HIGHLIGHT_COLOR
        }),
      );
    });

    it('should skip components without structures when applying highlights', async () => {
      const user = userEvent.setup();
      const wizardState = createMockWizardState(false);
      // Add structure only to base
      wizardState.base.structure = {
        atoms: BASE_ATOMS,
        bonds: BASE_BONDS,
      } as any;

      render(
        <RnaPresetTabs
          wizardState={wizardState}
          editor={mockEditor}
          wizardStateDispatch={mockWizardStateDispatch}
        />,
      );

      mockHighlightsClear.mockClear();
      mockHighlightsCreate.mockClear();

      // Switch to Base tab
      const baseTab = screen.getByTestId('nucleotide-base-tab');
      await user.click(baseTab);

      // Should only create highlight for base (the only one with structure)
      expect(mockHighlightsCreate).toHaveBeenCalled();
      expect(mockHighlightsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          atoms: BASE_ATOMS,
          bonds: BASE_BONDS,
          rgroupAttachmentPoints: EMPTY_RGROUP_ATTACHMENT_POINTS,
          color: ACTIVE_HIGHLIGHT_COLOR, // ACTIVE_HIGHLIGHT_COLOR
        }),
      );

      // Verify it was NOT called with sugar or phosphate (they have no structures)
      expect(mockHighlightsCreate).not.toHaveBeenCalledWith(
        expect.objectContaining({
          atoms: SUGAR_ATOMS,
        }),
      );
      expect(mockHighlightsCreate).not.toHaveBeenCalledWith(
        expect.objectContaining({
          bonds: PHOSPHATE_BONDS,
        }),
      );
    });
  });

  describe('Highlights cleared when toggle is disabled', () => {
    it('should clear highlights when checkbox is unchecked', async () => {
      const user = userEvent.setup();
      const wizardState = createMockWizardState(true);

      render(
        <RnaPresetTabs
          wizardState={wizardState}
          editor={mockEditor}
          wizardStateDispatch={mockWizardStateDispatch}
        />,
      );

      mockHighlightsClear.mockClear();
      mockHighlightsCreate.mockClear();

      // Uncheck the highlight checkbox
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      // Should clear highlights
      expect(mockHighlightsClear).toHaveBeenCalled();

      // Should NOT create new highlights
      expect(mockHighlightsCreate).not.toHaveBeenCalled();
    });

    it('should not apply highlights when switching tabs if toggle is disabled', async () => {
      const user = userEvent.setup();
      const wizardState = createMockWizardState(true);

      render(
        <RnaPresetTabs
          wizardState={wizardState}
          editor={mockEditor}
          wizardStateDispatch={mockWizardStateDispatch}
        />,
      );

      // Disable highlights
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      mockHighlightsClear.mockClear();
      mockHighlightsCreate.mockClear();

      // Switch to Base tab
      const baseTab = screen.getByTestId('nucleotide-base-tab');
      await user.click(baseTab);

      // Should clear highlights
      expect(mockHighlightsClear).toHaveBeenCalled();

      // Should NOT create new highlights
      expect(mockHighlightsCreate).not.toHaveBeenCalled();
    });

    it('should re-apply highlights when checkbox is checked again', async () => {
      const user = userEvent.setup();
      const wizardState = createMockWizardState(true);

      render(
        <RnaPresetTabs
          wizardState={wizardState}
          editor={mockEditor}
          wizardStateDispatch={mockWizardStateDispatch}
        />,
      );

      // First switch to a tab with structure
      const baseTab = screen.getByTestId('nucleotide-base-tab');
      await user.click(baseTab);

      // Disable highlights
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      mockHighlightsClear.mockClear();
      mockHighlightsCreate.mockClear();

      // Re-enable highlights
      await user.click(checkbox);

      // Should clear and recreate highlights (may be called multiple times due to effects)
      expect(mockHighlightsClear).toHaveBeenCalled();
      expect(mockHighlightsCreate).toHaveBeenCalled();

      // Verify highlights are created for all three components
      expect(mockHighlightsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          atoms: BASE_ATOMS,
          bonds: BASE_BONDS,
          color: ACTIVE_HIGHLIGHT_COLOR, // ACTIVE_HIGHLIGHT_COLOR for base
        }),
      );
    });
  });

  describe('Integration tests for highlight toggle with tab switching', () => {
    it('should maintain highlight state across multiple tab switches', async () => {
      const user = userEvent.setup();
      const wizardState = createMockWizardState(true);

      render(
        <RnaPresetTabs
          wizardState={wizardState}
          editor={mockEditor}
          wizardStateDispatch={mockWizardStateDispatch}
        />,
      );

      const checkbox = screen.getByRole('checkbox');
      const baseTab = screen.getByTestId('nucleotide-base-tab');
      const sugarTab = screen.getByTestId('nucleotide-sugar-tab');

      // Switch to base tab
      await user.click(baseTab);
      mockHighlightsCreate.mockClear();

      // Disable highlights
      await user.click(checkbox);

      // Switch to sugar tab (should not create highlights)
      await user.click(sugarTab);
      expect(mockHighlightsCreate).not.toHaveBeenCalled();

      // Enable highlights
      await user.click(checkbox);

      // Should now have highlights
      expect(mockHighlightsCreate).toHaveBeenCalled();
    });

    it('should handle rapid toggle and tab switch operations', async () => {
      const user = userEvent.setup();
      const wizardState = createMockWizardState(true);

      render(
        <RnaPresetTabs
          wizardState={wizardState}
          editor={mockEditor}
          wizardStateDispatch={mockWizardStateDispatch}
        />,
      );

      const checkbox = screen.getByRole('checkbox');
      const baseTab = screen.getByTestId('nucleotide-base-tab');
      const sugarTab = screen.getByTestId('nucleotide-sugar-tab');

      // Rapid operations
      await user.click(checkbox); // Disable
      await user.click(baseTab); // Switch tab
      await user.click(checkbox); // Enable
      await user.click(sugarTab); // Switch tab

      // Should have cleared and created highlights appropriately
      expect(mockHighlightsClear).toHaveBeenCalled();
      expect(mockHighlightsCreate).toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty wizard state gracefully', () => {
      const emptyWizardState = createMockWizardState(false);

      render(
        <RnaPresetTabs
          wizardState={emptyWizardState}
          editor={mockEditor}
          wizardStateDispatch={mockWizardStateDispatch}
        />,
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toBeChecked();
    });

    it('should not crash when structures have empty atoms arrays', () => {
      const wizardState = createMockWizardState(false);
      wizardState.base.structure = { atoms: [], bonds: [] } as any;

      render(
        <RnaPresetTabs
          wizardState={wizardState}
          editor={mockEditor}
          wizardStateDispatch={mockWizardStateDispatch}
        />,
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      // Should not crash
      expect(mockHighlightsClear).toHaveBeenCalled();
    });

    it('should handle undefined atoms and bonds arrays', async () => {
      const user = userEvent.setup();
      const wizardState = createMockWizardState(false);
      wizardState.base.structure = {
        atoms: undefined,
        bonds: undefined,
      } as any;

      render(
        <RnaPresetTabs
          wizardState={wizardState}
          editor={mockEditor}
          wizardStateDispatch={mockWizardStateDispatch}
        />,
      );

      const baseTab = screen.getByTestId('nucleotide-base-tab');
      await user.click(baseTab);

      // Should create highlight with empty arrays as fallback
      expect(mockHighlightsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          atoms: [],
          bonds: [],
        }),
      );
    });
  });
});
