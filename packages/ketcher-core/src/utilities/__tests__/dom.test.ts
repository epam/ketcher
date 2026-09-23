import {
  guardForMacromoleculesEditor,
  guardForMicromoleculesEditor,
} from '../dom';

describe('guardForMacromoleculesEditor', () => {
  const originalValue = window.isPolymerEditorTurnedOn;

  afterEach(() => {
    window.isPolymerEditorTurnedOn = originalValue;
  });

  it('calls the handler when the macromolecules editor is active', () => {
    window.isPolymerEditorTurnedOn = true;
    const handler = jest.fn();
    const guarded = guardForMacromoleculesEditor(handler);

    guarded('arg1', 'arg2');

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('does not call the handler when the macromolecules editor is inactive', () => {
    window.isPolymerEditorTurnedOn = false;
    const handler = jest.fn();
    const guarded = guardForMacromoleculesEditor(handler);

    guarded('arg1');

    expect(handler).not.toHaveBeenCalled();
  });

  it('returns the handler return value when active', () => {
    window.isPolymerEditorTurnedOn = true;
    const handler = jest.fn().mockReturnValue('result');
    const guarded = guardForMacromoleculesEditor(handler);

    const result = guarded();

    expect(result).toBe('result');
  });

  it('returns undefined when inactive', () => {
    window.isPolymerEditorTurnedOn = false;
    const handler = jest.fn().mockReturnValue('result');
    const guarded = guardForMacromoleculesEditor(handler);

    const result = guarded();

    expect(result).toBeUndefined();
  });
});

describe('guardForMicromoleculesEditor', () => {
  const originalValue = window.isPolymerEditorTurnedOn;

  afterEach(() => {
    window.isPolymerEditorTurnedOn = originalValue;
  });

  it('calls the handler when the micromolecules editor is active', () => {
    window.isPolymerEditorTurnedOn = false;
    const handler = jest.fn();
    const guarded = guardForMicromoleculesEditor(handler);

    guarded('arg1', 'arg2');

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('does not call the handler when the micromolecules editor is inactive', () => {
    window.isPolymerEditorTurnedOn = true;
    const handler = jest.fn();
    const guarded = guardForMicromoleculesEditor(handler);

    guarded('arg1');

    expect(handler).not.toHaveBeenCalled();
  });

  it('returns the handler return value when active', () => {
    window.isPolymerEditorTurnedOn = false;
    const handler = jest.fn().mockReturnValue('result');
    const guarded = guardForMicromoleculesEditor(handler);

    const result = guarded();

    expect(result).toBe('result');
  });

  it('returns undefined when inactive', () => {
    window.isPolymerEditorTurnedOn = true;
    const handler = jest.fn().mockReturnValue('result');
    const guarded = guardForMicromoleculesEditor(handler);

    const result = guarded();

    expect(result).toBeUndefined();
  });
});
