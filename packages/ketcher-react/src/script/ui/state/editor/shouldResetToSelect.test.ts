import {
  IMAGE_KEY,
  MULTITAIL_ARROW_TOOL_NAME,
  RxnArrowMode,
} from 'ketcher-core';
import { shouldResetToSelect } from './shouldResetToSelect';

describe('shouldResetToSelect', () => {
  it.each([IMAGE_KEY, 'reactionplus', 'simpleobject', 'text'])(
    'resets after using the one-shot %s tool regardless of the setting',
    (activeTool) => {
      expect(shouldResetToSelect(activeTool, false)).toBe(true);
      expect(shouldResetToSelect(activeTool, 'paste')).toBe(true);
    },
  );

  it('resets after using any regular reaction arrow', () => {
    expect(
      shouldResetToSelect('reactionarrow', false, RxnArrowMode.OpenAngle),
    ).toBe(true);
    expect(shouldResetToSelect('reactionarrow', false)).toBe(true);
  });

  it('keeps the Multi-Tailed Arrow tool active', () => {
    expect(
      shouldResetToSelect('reactionarrow', false, MULTITAIL_ARROW_TOOL_NAME),
    ).toBe(false);
  });

  it('preserves the Reset to Select setting for other tools', () => {
    expect(shouldResetToSelect('bond', true)).toBe(true);
    expect(shouldResetToSelect('paste', 'paste')).toBe(true);
    expect(shouldResetToSelect('bond', false)).toBe(false);
    expect(shouldResetToSelect('bond', 'paste')).toBe(false);
  });

  it('lets the Reset to Select setting override the Multi-Tailed Arrow exception', () => {
    expect(
      shouldResetToSelect('reactionarrow', true, MULTITAIL_ARROW_TOOL_NAME),
    ).toBe(true);
  });
});
