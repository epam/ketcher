import { render, waitFor } from '@testing-library/react';
import ClipArea from './cliparea';

const mockNotifyCopyCut = jest.fn();
const mockNotifyRequestCompleted = jest.fn();

jest.mock(
  'ketcher-core',
  () => ({
    KetcherLogger: { error: jest.fn() },
    isClipboardAPIAvailable: jest.fn(() => true),
    isControlKey: jest.fn(() => false),
    notifyCopyCut: () => mockNotifyCopyCut(),
    notifyRequestCompleted: () => mockNotifyRequestCompleted(),
  }),
  { virtual: true },
);

class MockClipboardItem {
  public readonly items: Record<string, Promise<Blob>>;

  constructor(items: Record<string, Promise<Blob>>) {
    this.items = items;
  }
}

describe('ClipArea clipboard handling', () => {
  let target: HTMLDivElement;

  beforeEach(() => {
    target = document.createElement('div');
    document.body.appendChild(target);

    Object.defineProperty(global, 'ClipboardItem', {
      value: MockClipboardItem,
      configurable: true,
    });
    Object.defineProperty(window.navigator, 'clipboard', {
      value: {
        read: jest.fn().mockResolvedValue([{ types: ['text/plain'] }]),
        write: jest.fn().mockResolvedValue(undefined),
      },
      configurable: true,
    });
  });

  afterEach(() => {
    target.remove();
    jest.clearAllMocks();
  });

  it('prevents the native copy action before async clipboard writes complete', async () => {
    let resolveCopy: ((data: { 'text/plain': string }) => void) | undefined;

    render(
      <ClipArea
        target={target}
        formats={[]}
        focused={() => true}
        onCopy={() =>
          new Promise((resolve) => {
            resolveCopy = resolve;
          })
        }
        onCut={jest.fn()}
        onPaste={jest.fn()}
        onLegacyCut={jest.fn()}
        onLegacyPaste={jest.fn()}
      />,
    );

    const event = new Event('copy', {
      bubbles: true,
      cancelable: true,
    }) as ClipboardEvent;

    target.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);

    expect(resolveCopy).toBeDefined();

    if (resolveCopy) {
      resolveCopy({ 'text/plain': 'copied structure' });
    }

    await waitFor(() =>
      expect(window.navigator.clipboard.write).toHaveBeenCalledTimes(1),
    );
    expect(mockNotifyCopyCut).toHaveBeenCalledTimes(1);
  });

  it('prevents the native cut action before async clipboard writes complete', async () => {
    let resolveCut: ((data: { 'text/plain': string }) => void) | undefined;

    render(
      <ClipArea
        target={target}
        formats={[]}
        focused={() => true}
        onCopy={jest.fn()}
        onCut={() =>
          new Promise((resolve) => {
            resolveCut = resolve;
          })
        }
        onPaste={jest.fn()}
        onLegacyCut={jest.fn()}
        onLegacyPaste={jest.fn()}
      />,
    );

    const event = new Event('cut', {
      bubbles: true,
      cancelable: true,
    }) as ClipboardEvent;

    target.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);

    expect(resolveCut).toBeDefined();

    if (resolveCut) {
      resolveCut({ 'text/plain': 'cut structure' });
    }

    await waitFor(() =>
      expect(window.navigator.clipboard.write).toHaveBeenCalledTimes(1),
    );
    expect(mockNotifyCopyCut).toHaveBeenCalledTimes(1);
  });

  it('prevents the native paste action before async clipboard reads complete', async () => {
    const onPaste = jest.fn().mockResolvedValue(undefined);

    render(
      <ClipArea
        target={target}
        formats={[]}
        focused={() => true}
        onCopy={jest.fn()}
        onCut={jest.fn()}
        onPaste={onPaste}
        onLegacyCut={jest.fn()}
        onLegacyPaste={jest.fn()}
      />,
    );

    const event = new Event('paste', {
      bubbles: true,
      cancelable: true,
    }) as ClipboardEvent;

    target.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);

    await waitFor(() => expect(onPaste).toHaveBeenCalledTimes(1));
    expect(mockNotifyRequestCompleted).toHaveBeenCalledTimes(1);
  });
});
