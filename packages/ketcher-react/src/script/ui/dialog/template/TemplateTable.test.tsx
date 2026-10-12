// jest.mock is hoisted before imports, so the factory must be self-contained.
jest.mock('./TemplateItem', () => ({
  __esModule: true,
  default: ({
    tmpl,
    nameOccurrenceIndex,
  }: {
    tmpl: { struct: { name: string } };
    nameOccurrenceIndex?: number;
  }) => (
    <div
      data-testid={
        nameOccurrenceIndex !== undefined
          ? `${tmpl.struct.name}_${nameOccurrenceIndex}`
          : tmpl.struct.name
      }
    />
  ),
}));

import { render, screen } from '@testing-library/react';
import { Struct } from 'ketcher-core';
import TemplateTable from './TemplateTable';

function makeTemplate(name: string) {
  const struct = new Struct();
  struct.name = name;
  return {
    struct,
    props: { atomid: 0, bondid: 0, group: 'Test', name },
  };
}

describe('TemplateTable — nameOccurrenceIndex prop', () => {
  it('passes undefined for uniquely named templates (bare testid)', () => {
    render(
      <TemplateTable
        templates={[
          makeTemplate('Benzene'),
          makeTemplate('Toluene'),
          makeTemplate('Naphthalene'),
        ]}
        selected={null}
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByTestId('Benzene')).toBeDefined();
    expect(screen.getByTestId('Toluene')).toBeDefined();
    expect(screen.getByTestId('Naphthalene')).toBeDefined();
  });

  it('appends _0, _1, _2 for three cards that share the same name', () => {
    render(
      <TemplateTable
        templates={[
          makeTemplate('Bicyclo[4-2-1]nonane'),
          makeTemplate('Bicyclo[4-2-1]nonane'),
          makeTemplate('Bicyclo[4-2-1]nonane'),
        ]}
        selected={null}
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByTestId('Bicyclo[4-2-1]nonane_0')).toBeDefined();
    expect(screen.getByTestId('Bicyclo[4-2-1]nonane_1')).toBeDefined();
    expect(screen.getByTestId('Bicyclo[4-2-1]nonane_2')).toBeDefined();
    // The bare name must not appear as a testid when all three are duplicates
    expect(screen.queryByTestId('Bicyclo[4-2-1]nonane')).toBeNull();
  });

  it('gives unique-named cards bare IDs and same-named cards ordinal IDs in the same group', () => {
    render(
      <TemplateTable
        templates={[
          makeTemplate('Benzene'),
          makeTemplate('Bicyclo[4-2-1]nonane'),
          makeTemplate('Bicyclo[4-2-1]nonane'),
        ]}
        selected={null}
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByTestId('Benzene')).toBeDefined();
    expect(screen.getByTestId('Bicyclo[4-2-1]nonane_0')).toBeDefined();
    expect(screen.getByTestId('Bicyclo[4-2-1]nonane_1')).toBeDefined();
    expect(screen.queryByTestId('Bicyclo[4-2-1]nonane')).toBeNull();
  });

  it('preserves ordinals when the list is narrowed to only the duplicate objects on rerender', () => {
    // Use the same three object references throughout so the rerender simulates
    // what happens when filterLib removes the unrelated templates but keeps the
    // duplicates in the same relative order.
    const dup0 = makeTemplate('Bicyclo[4-2-1]nonane');
    const dup1 = makeTemplate('Bicyclo[4-2-1]nonane');
    const dup2 = makeTemplate('Bicyclo[4-2-1]nonane');
    const unrelated = makeTemplate('Benzene');

    const { rerender } = render(
      <TemplateTable
        templates={[dup0, unrelated, dup1, dup2]}
        selected={null}
        onSelect={jest.fn()}
      />,
    );

    // Initial render: duplicates are interspersed with the unrelated card
    expect(screen.getByTestId('Bicyclo[4-2-1]nonane_0')).toBeDefined();
    expect(screen.getByTestId('Bicyclo[4-2-1]nonane_1')).toBeDefined();
    expect(screen.getByTestId('Bicyclo[4-2-1]nonane_2')).toBeDefined();
    expect(screen.getByTestId('Benzene')).toBeDefined();

    // Rerender with only the three duplicate objects — simulates a filtered view
    rerender(
      <TemplateTable
        templates={[dup0, dup1, dup2]}
        selected={null}
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByTestId('Bicyclo[4-2-1]nonane_0')).toBeDefined();
    expect(screen.getByTestId('Bicyclo[4-2-1]nonane_1')).toBeDefined();
    expect(screen.getByTestId('Bicyclo[4-2-1]nonane_2')).toBeDefined();
    expect(screen.queryByTestId('Benzene')).toBeNull();
  });

  it('assigns independent ordinals per distinct name within the same group', () => {
    render(
      <TemplateTable
        templates={[
          makeTemplate('Ring5'),
          makeTemplate('Cyclopentadiene'),
          makeTemplate('Ring5'),
          makeTemplate('Cyclopentadiene'),
        ]}
        selected={null}
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByTestId('Ring5_0')).toBeDefined();
    expect(screen.getByTestId('Ring5_1')).toBeDefined();
    expect(screen.getByTestId('Cyclopentadiene_0')).toBeDefined();
    expect(screen.getByTestId('Cyclopentadiene_1')).toBeDefined();
  });
});
