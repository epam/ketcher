import { KETCHER_SAVED_OPTIONS_KEY } from 'src/constants';

interface SavedOptions {
  ignoreChiralFlag?: boolean;
}

export class OptionsManager {
  static getOptions(): SavedOptions {
    try {
      return JSON.parse(
        localStorage.getItem(KETCHER_SAVED_OPTIONS_KEY) || '{}',
      );
    } catch (e) {
      return {} as SavedOptions;
    }
  }

  static saveSettings(settings: SavedOptions) {
    if (!settings) {
      return;
    }
    localStorage.setItem(KETCHER_SAVED_OPTIONS_KEY, JSON.stringify(settings));
  }

  static get ignoreChiralFlag() {
    const { ignoreChiralFlag } = this.getOptions();

    return ignoreChiralFlag;
  }

  static set ignoreChiralFlag(ignoreChiralFlag: boolean | undefined) {
    const settings = this.getOptions();

    this.saveSettings({
      ...settings,
      ignoreChiralFlag,
    });
  }
}
