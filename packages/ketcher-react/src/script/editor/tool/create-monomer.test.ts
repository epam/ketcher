import { SettingsManager } from 'ketcher-core';
import CreateMonomerTool from './create-monomer';
import type Editor from '../Editor';

describe('CreateMonomerTool', () => {
  const initialSelectionTool = SettingsManager.selectionTool;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    SettingsManager.selectionTool = initialSelectionTool;
    jest.useRealTimers();
  });

  it('restores previously selected selection mode', () => {
    const editor = {
      openMonomerCreationWizard: jest.fn(),
      tool: jest.fn(),
    };

    SettingsManager.selectionTool = { tool: 'select', opts: 'fragment' };

    const tool = new CreateMonomerTool(editor as unknown as Editor);

    expect(tool).toBeDefined();
    expect(editor.openMonomerCreationWizard).toHaveBeenCalledTimes(1);

    jest.runAllTimers();

    expect(editor.tool).toHaveBeenCalledWith('select', 'fragment');
  });
});
