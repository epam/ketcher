import { vi } from 'vitest';
import { FlexMode } from 'application/editor/modes/FlexMode';
import { provideEditorInstance } from '../../editorSingleton';

vi.mock('../../editorSingleton', () => ({
  provideEditorInstance: vi.fn(),
}));

describe('BaseMode.onKeyDown', () => {
  it('stops propagation for a registered shortcut and invokes its handler', async () => {
    const handler = vi.fn();
    const dispatch = vi.fn();
    vi.mocked(provideEditorInstance).mockReturnValue({
      events: { mouseLeaveSequenceItem: { dispatch } },
    } as unknown as ReturnType<typeof provideEditorInstance>);
    class TestMode extends FlexMode {
      get keyboardEventHandlers() {
        return { 'test-shortcut': { shortcut: 'a', handler } };
      }
    }
    const event = new KeyboardEvent('keydown', { key: 'a', code: 'KeyA' });
    const stopPropagation = vi.spyOn(event, 'stopImmediatePropagation');

    const completion = new TestMode().onKeyDown(event);

    expect(stopPropagation).toHaveBeenCalledTimes(1);
    await completion;
    expect(handler).toHaveBeenCalledWith(event);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});
