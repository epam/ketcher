import type { ComponentProps } from 'react';
import { render } from '@testing-library/react';
import ClipArea from './cliparea';

// A Safari UA string (contains "Safari" but not "Chrome"/"Android").
const SAFARI_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 ' +
  '(KHTML, like Gecko) Version/17.0 Safari/605.1.15';
// A Chrome UA string (contains "Chrome" so it is not detected as Safari).
const CHROME_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const setUserAgent = (userAgent: string) => {
  Object.defineProperty(window.navigator, 'userAgent', {
    value: userAgent,
    configurable: true,
  });
};

const setClipboard = (clipboard: Partial<Clipboard> | undefined) => {
  Object.defineProperty(window.navigator, 'clipboard', {
    value: clipboard,
    configurable: true,
  });
};

const renderClipArea = () => {
  const target = document.createElement('div');
  const props: ComponentProps<typeof ClipArea> = {
    formats: ['text/plain'],
    focused: () => true,
    onCopy: jest.fn().mockResolvedValue(null),
    onCut: jest.fn().mockResolvedValue(null),
    onPaste: jest.fn().mockResolvedValue(undefined),
    onLegacyCopy: jest.fn(),
    onLegacyCut: jest.fn(),
    onLegacyPaste: jest.fn(),
    target,
  };
  render(<ClipArea {...props} />);
  return { target, props };
};

const dispatchPaste = (target: HTMLElement, text: string) => {
  const event = new Event('paste', { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'clipboardData', {
    value: {
      getData: (format: string) => (format === 'text/plain' ? text : ''),
    },
    configurable: true,
  });
  target.dispatchEvent(event);
};

describe('ClipArea paste', () => {
  const originalUserAgent = window.navigator.userAgent;
  const originalClipboard = window.navigator.clipboard;

  afterEach(() => {
    setUserAgent(originalUserAgent);
    setClipboard(originalClipboard);
  });

  it('reads from the async Clipboard API on non-Safari browsers', () => {
    setUserAgent(CHROME_USER_AGENT);
    const read = jest.fn().mockResolvedValue([]);
    setClipboard({ read, writeText: jest.fn() } as unknown as Clipboard);

    const { target, props } = renderClipArea();
    dispatchPaste(target, 'CCC');

    expect(read).toHaveBeenCalled();
    expect(props.onLegacyPaste).not.toHaveBeenCalled();
  });

  // Safari rejects navigator.clipboard.read() when it is called from a paste
  // event, so paste has to fall back to the synchronous clipboardData (#9887).
  it('falls back to the synchronous paste event data on Safari', () => {
    setUserAgent(SAFARI_USER_AGENT);
    const read = jest.fn().mockResolvedValue([]);
    setClipboard({ read, writeText: jest.fn() } as unknown as Clipboard);

    const { target, props } = renderClipArea();
    dispatchPaste(target, 'CCC');

    expect(read).not.toHaveBeenCalled();
    expect(props.onLegacyPaste).toHaveBeenCalledWith(
      expect.objectContaining({ 'text/plain': 'CCC' }),
    );
  });
});
