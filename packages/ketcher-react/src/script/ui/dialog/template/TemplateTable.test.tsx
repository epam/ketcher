import { act, render, screen } from '@testing-library/react';
import { Struct } from 'ketcher-core';
import TemplateTable, { type Template } from './TemplateTable';

// jest.mock is hoisted before imports, so the factory must be self-contained.
jest.mock('./TemplateItem', () => ({
  __esModule: true,
  default: ({
    tmpl,
    nameOccurrenceIndex,
    shouldRenderPreview,
  }: {
    tmpl: { struct: { name: string } };
    nameOccurrenceIndex?: number;
    shouldRenderPreview: boolean;
  }) => (
    <div
      data-testid="template-item"
      data-preview={shouldRenderPreview ? 'true' : 'false'}
    >
      <div
        data-testid={
          nameOccurrenceIndex !== undefined
            ? `${tmpl.struct.name}_${nameOccurrenceIndex}`
            : tmpl.struct.name
        }
      />
    </div>
  ),
}));

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

const originalRequestIdleCallback = globalThis.requestIdleCallback;
const originalCancelIdleCallback = globalThis.cancelIdleCallback;

const createTemplates = (count: number): Template[] =>
  Array.from({ length: count }, (_, index) => {
    const struct = new Struct();
    struct.name = `template-${index}`;

    return {
      struct,
      props: {
        atomid: 0,
        bondid: 0,
        group: 'User Templates',
        name: struct.name,
      },
    };
  });

const getPreviewStates = () =>
  screen
    .getAllByTestId('template-item')
    .map((item) => item.getAttribute('data-preview'));

describe('TemplateTable', () => {
  let idleCallbacks: Array<() => void>;
  let requestIdleCallback: jest.Mock;

  beforeEach(() => {
    idleCallbacks = [];
    requestIdleCallback = jest.fn((callback: () => void) => {
      idleCallbacks.push(callback);
      return idleCallbacks.length;
    });

    Object.defineProperty(globalThis, 'requestIdleCallback', {
      configurable: true,
      value: requestIdleCallback,
    });
    Object.defineProperty(globalThis, 'cancelIdleCallback', {
      configurable: true,
      value: jest.fn(),
    });
  });

  afterEach(() => {
    if (originalRequestIdleCallback) {
      Object.defineProperty(globalThis, 'requestIdleCallback', {
        configurable: true,
        value: originalRequestIdleCallback,
      });
    } else {
      Reflect.deleteProperty(globalThis, 'requestIdleCallback');
    }

    if (originalCancelIdleCallback) {
      Object.defineProperty(globalThis, 'cancelIdleCallback', {
        configurable: true,
        value: originalCancelIdleCallback,
      });
    } else {
      Reflect.deleteProperty(globalThis, 'cancelIdleCallback');
    }
  });

  it('schedules the next preview batch after the current batch commits', () => {
    render(
      <TemplateTable
        templates={createTemplates(10)}
        selected={null}
        onSelect={jest.fn()}
      />,
    );

    expect(getPreviewStates()).toEqual([
      'true',
      'true',
      'true',
      'true',
      'false',
      'false',
      'false',
      'false',
      'false',
      'false',
    ]);
    expect(requestIdleCallback).toHaveBeenCalledWith(expect.any(Function), {
      timeout: 100,
    });

    act(() => {
      idleCallbacks.shift()?.();
      expect(idleCallbacks).toHaveLength(0);
    });

    expect(getPreviewStates().slice(0, 8)).toEqual([
      'true',
      'true',
      'true',
      'true',
      'true',
      'true',
      'true',
      'true',
    ]);
    expect(requestIdleCallback).toHaveBeenCalledTimes(2);

    act(() => {
      idleCallbacks.shift()?.();
    });

    expect(getPreviewStates()).toEqual(Array(10).fill('true'));
    expect(requestIdleCallback).toHaveBeenCalledTimes(2);
  });
});
