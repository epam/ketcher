import { KETCHER_SAVED_OPTIONS_KEY } from 'src/constants';
import { storage } from '../storage-ext';

interface SavedOptions {
  ignoreChiralFlag?: boolean;
}

export class OptionsManager {
  static getOptions(): SavedOptions {
    try {
      return JSON.parse(storage.getItem(KETCHER_SAVED_OPTIONS_KEY) || '{}');
    } catch (e) {
      return {} as SavedOptions;
    }
  }

  static saveSettings(settings: SavedOptions) {
    if (!settings) {
      return;
    }
    storage.setItem(KETCHER_SAVED_OPTIONS_KEY, JSON.stringify(settings));
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
