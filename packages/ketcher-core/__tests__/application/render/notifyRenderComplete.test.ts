import { vi } from 'vitest';
import { notifyRenderComplete } from 'application/render/notifyRenderComplete';

describe('notifyRenderComplete', () => {
  const onRenderComplete = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    window.addEventListener('renderComplete', onRenderComplete);
  });

  afterEach(() => {
    window.removeEventListener('renderComplete', onRenderComplete);
    notifyRenderComplete.cancel();
    vi.useRealTimers();
    onRenderComplete.mockClear();
  });

  it('dispatches once 50 ms after the last notification', () => {
    notifyRenderComplete();
    vi.advanceTimersByTime(49);
    expect(onRenderComplete).not.toHaveBeenCalled();

    notifyRenderComplete();
    vi.advanceTimersByTime(49);
    expect(onRenderComplete).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onRenderComplete).toHaveBeenCalledTimes(1);
  });
});
