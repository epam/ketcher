import { render, screen } from '@testing-library/react';
import { AmbiguousMonomerPreview } from './AmbiguousMonomerPreview';
import { AmbiguousMonomerPreviewState, PreviewType } from './types';
import { AmbiguousMonomerType } from 'ketcher-core';

describe('AmbiguousMonomerPreview', () => {
  it('should sort mixed monomers by percentage from highest to lowest', () => {
    const mockMonomer = {
      id: 'test-monomer',
      label: 'Test',
      subtype: 'mixed' as const,
      isAmbiguous: true as const,
      monomers: [
        {
          label: 'A',
          monomerItem: {
            props: {
              id: 'monomer1',
              Name: '6-(p-Nitrobenzylthio)purine',
            },
          },
        },
        {
          label: 'B',
          monomerItem: {
            props: {
              id: 'monomer2',
              Name: '6-Aminohexyl-8-aminoadenine',
            },
          },
        },
        {
          label: 'C',
          monomerItem: {
            props: {
              id: 'monomer3',
              Name: '6-Aminohexyl-2-aminoguanine',
            },
          },
        },
        {
          label: 'D',
          monomerItem: {
            props: {
              id: 'monomer4',
              Name: '3-(Dimethylamino)propylaminoadenine',
            },
          },
        },
      ],
      options: [
        { templateId: 'monomer1', ratio: undefined },
        { templateId: 'monomer2', ratio: 3 },
        { templateId: 'monomer3', ratio: 2 },
        { templateId: 'monomer4', ratio: undefined },
      ],
    };

    const preview: AmbiguousMonomerPreviewState = {
      type: PreviewType.AmbiguousMonomer,
      monomer: mockMonomer as unknown as AmbiguousMonomerType,
      presetMonomers: undefined,
    };

    const { container } = render(<AmbiguousMonomerPreview preview={preview} />);

    const header = screen.getByTestId('preview-tooltip-title');
    expect(header).toHaveTextContent('Mixed');

    // Get the text content and extract percentages
    const containerText = container.textContent || '';
    const percentMatches = containerText.match(/(\d+)%/g);
    expect(percentMatches).not.toBeNull();

    const percentages =
      percentMatches?.map((match) => parseInt(match.replace('%', ''), 10)) ||
      [];

    // Verify percentages are sorted from highest to lowest
    for (let i = 0; i < percentages.length - 1; i++) {
      expect(percentages[i]).toBeGreaterThanOrEqual(percentages[i + 1]);
    }

    // Verify the expected percentages are present and in correct order
    expect(percentages).toEqual([43, 29, 14, 14]);
  });

  it('should sort alternatives alphabetically', () => {
    const mockMonomer = {
      id: 'test-monomer',
      label: 'Test',
      subtype: 'alternatives' as const,
      isAmbiguous: true as const,
      monomers: [
        {
          label: 'C',
          monomerItem: {
            props: {
              id: 'monomer3',
              Name: 'Cytosine',
            },
          },
        },
        {
          label: 'A',
          monomerItem: {
            props: {
              id: 'monomer1',
              Name: 'Adenine',
            },
          },
        },
        {
          label: 'B',
          monomerItem: {
            props: {
              id: 'monomer2',
              Name: 'Base',
            },
          },
        },
      ],
      options: [],
    };

    const preview: AmbiguousMonomerPreviewState = {
      type: PreviewType.AmbiguousMonomer,
      monomer: mockMonomer as unknown as AmbiguousMonomerType,
      presetMonomers: undefined,
    };

    const { container } = render(<AmbiguousMonomerPreview preview={preview} />);

    const header = screen.getByTestId('preview-tooltip-title');
    expect(header).toHaveTextContent('Alternatives');

    // Get the text content and extract the monomer names
    // Remove the header text to get just the names
    const containerText = container.textContent || '';
    const names = containerText
      .replace('Alternatives', '')
      .split(/(?=[A-Z])/)
      .filter((name) => name.trim().length > 0);

    // Expected alphabetically sorted names
    expect(names).toEqual(['Adenine', 'Base', 'Cytosine']);
  });
});
