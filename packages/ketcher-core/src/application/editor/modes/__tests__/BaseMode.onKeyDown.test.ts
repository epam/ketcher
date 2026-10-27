import { FlexMode } from 'application/editor/modes/FlexMode';
import { provideEditorInstance } from '../../editorSingleton';

jest.mock('../../editorSingleton', () => ({
  provideEditorInstance: jest.fn(),
}));

describe('BaseMode.onKeyDown', () => {
  it('stops propagation for a registered shortcut and invokes its handler', async () => {
    const handler = jest.fn();
    const dispatch = jest.fn();
    (provideEditorInstance as jest.Mock).mockReturnValue({
      events: { mouseLeaveSequenceItem: { dispatch } },
    });
    class TestMode extends FlexMode {
      get keyboardEventHandlers() {
        return { 'test-shortcut': { shortcut: 'a', handler } };
      }
    }
    const event = new KeyboardEvent('keydown', { key: 'a', code: 'KeyA' });
    const stopPropagation = jest.spyOn(event, 'stopImmediatePropagation');

    const completion = new TestMode().onKeyDown(event);

    expect(stopPropagation).toHaveBeenCalledTimes(1);
    await completion;
    expect(handler).toHaveBeenCalledWith(event);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});
