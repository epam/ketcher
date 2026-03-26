import { initOptionsState } from './index';

describe('options state server settings', () => {
  it('should include the selected font in serialized server settings', () => {
    const optionsState = {
      ...initOptionsState,
      settings: {
        ...initOptionsState.settings,
        font: '24px Helvetica',
      },
    };

    expect(initOptionsState.getServerSettings.call(optionsState)).toEqual(
      expect.objectContaining({
        font: '24px Helvetica',
      }),
    );
  });
});
