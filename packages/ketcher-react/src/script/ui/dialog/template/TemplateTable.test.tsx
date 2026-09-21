import { act, render, screen } from '@testing-library/react';
import { Struct } from 'ketcher-core';
import TemplateTable, { type Template } from './TemplateTable';

jest.mock('./TemplateItem', () => ({
  __esModule: true,
  default: ({ shouldRenderPreview }: { shouldRenderPreview: boolean }) => (
    <div
      data-testid="template-item"
      data-preview={shouldRenderPreview ? 'true' : 'false'}
    />
  ),
}));

const originalRequestIdleCallback = window.requestIdleCallback;
const originalCancelIdleCallback = window.cancelIdleCallback;

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

    Object.defineProperty(window, 'requestIdleCallback', {
      configurable: true,
      value: requestIdleCallback,
    });
    Object.defineProperty(window, 'cancelIdleCallback', {
      configurable: true,
      value: jest.fn(),
    });
  });

  afterEach(() => {
    if (originalRequestIdleCallback) {
      Object.defineProperty(window, 'requestIdleCallback', {
        configurable: true,
        value: originalRequestIdleCallback,
      });
    } else {
      delete window.requestIdleCallback;
    }

    if (originalCancelIdleCallback) {
      Object.defineProperty(window, 'cancelIdleCallback', {
        configurable: true,
        value: originalCancelIdleCallback,
      });
    } else {
      delete window.cancelIdleCallback;
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
