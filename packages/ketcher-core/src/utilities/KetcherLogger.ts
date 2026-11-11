export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  LOG = 3,
}

export interface LogSettings {
  enabled?: boolean;
  showTrace?: boolean;
  level?: LogLevel;
}

export class KetcherLogger {
  static get settings(): LogSettings {
    if (typeof globalThis.window === 'undefined') {
      return {};
    }

    if (!globalThis?.ketcher) {
      console.warn(
        'Ketcher needs to be initialized before KetcherLogger is used',
      );
    }

    return globalThis.logging ?? {};
  }

  static set settings(newSettings: LogSettings) {
    for (const [settingName, settingValue] of Object.entries(newSettings)) {
      this.settings[settingName] = settingValue;
    }
  }

  static log(...messages: unknown[]): void {
    if (!this.isMinimumLogLevel(LogLevel.LOG)) {
      return;
    }

    const { showTrace } = this.settings;

    if (showTrace) {
      globalThis.console.trace(messages);
    } else {
      globalThis.console.log(messages);
    }
  }

  static info(...messages: unknown[]): void {
    if (!this.isMinimumLogLevel(LogLevel.INFO)) {
      return;
    }

    const { showTrace } = this.settings;

    if (showTrace) {
      globalThis.console.trace(messages);
    } else {
      globalThis.console.info(messages);
    }
  }

  static warn(...warnings: unknown[]): void {
    if (!this.isMinimumLogLevel(LogLevel.WARN)) {
      return;
    }

    globalThis.console.warn(warnings);
  }

  static error(...errors: unknown[]): void {
    if (!this.isMinimumLogLevel(LogLevel.ERROR)) {
      return;
    }

    globalThis.console.error(errors);
  }

  private static isMinimumLogLevel(minimumLevel: LogLevel): boolean {
    const { enabled, level } = this.settings;

    if (!enabled || level == null) {
      return false;
    }

    return level >= minimumLevel;
  }
}
