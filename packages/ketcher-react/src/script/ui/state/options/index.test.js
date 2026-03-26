import { initOptionsState } from './index';

describe('options state server settings', () => {
  it('should include the selected font in serialized server settings', () => {
    const previousSettings = initOptionsState.settings;

    initOptionsState.settings = {
      ...initOptionsState.settings,
      font: '24px Helvetica',
    };

    expect(initOptionsState.getServerSettings()).toEqual(
      expect.objectContaining({
        font: '24px Helvetica',
      }),
    );

    initOptionsState.settings = previousSettings;
  });
});
