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
    if (!window?.ketcher) {
      throw new Error(
        'Ketcher needs to be initialized before KetcherLogger is used',
      );
    }

    return window.ketcher.logging;
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
      window.console.trace(messages);
    } else {
      window.console.log(messages);
    }
  }

  static info(...messages: unknown[]): void {
    if (!this.isMinimumLogLevel(LogLevel.INFO)) {
      return;
    }

    const { showTrace } = this.settings;

    if (showTrace) {
      window.console.trace(messages);
    } else {
      window.console.info(messages);
    }
  }

  static warn(...warnings: unknown[]): void {
    if (!this.isMinimumLogLevel(LogLevel.WARN)) {
      return;
    }

    window.console.warn(warnings);
  }

  static error(...errors: unknown[]): void {
    if (!this.isMinimumLogLevel(LogLevel.ERROR)) {
      return;
    }

    window.console.error(errors);
  }

  private static isMinimumLogLevel(minimumLevel: LogLevel): boolean {
    const { enabled, level } = this.settings;

    if (!enabled || level == null) {
      return false;
    }

    return level >= minimumLevel;
  }
}
