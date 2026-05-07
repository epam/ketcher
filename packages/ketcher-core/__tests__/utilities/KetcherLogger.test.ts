import { KetcherLogger, LogLevel } from 'utilities/KetcherLogger';

function setLogging(opts: { enabled?: boolean; level?: LogLevel } | undefined) {
  (window as unknown as Record<string, unknown>).ketcher =
    opts != null ? { logging: opts } : {};
}

describe('KetcherLogger', () => {
  let errorSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let infoSpy: jest.SpyInstance;
  let logSpy: jest.SpyInstance;
  let traceSpy: jest.SpyInstance;

  beforeEach(() => {
    errorSpy = jest.spyOn(window.console, 'error').mockImplementation(() => {});
    warnSpy = jest.spyOn(window.console, 'warn').mockImplementation(() => {});
    infoSpy = jest.spyOn(window.console, 'info').mockImplementation(() => {});
    logSpy = jest.spyOn(window.console, 'log').mockImplementation(() => {});
    traceSpy = jest.spyOn(window.console, 'trace').mockImplementation(() => {});
    // Default: no logging configured
    setLogging(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('when logging is not configured (default state)', () => {
    it('error() outputs to console.error', () => {
      KetcherLogger.error('something went wrong');
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });

    it('warn() is suppressed', () => {
      KetcherLogger.warn('a warning');
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('info() is suppressed', () => {
      KetcherLogger.info('some info');
      expect(infoSpy).not.toHaveBeenCalled();
    });

    it('log() is suppressed', () => {
      KetcherLogger.log('a log message');
      expect(logSpy).not.toHaveBeenCalled();
    });
  });

  describe('when logging is enabled with level LOG (most verbose)', () => {
    beforeEach(() => {
      setLogging({ enabled: true, level: LogLevel.LOG });
    });

    it('error() outputs to console.error', () => {
      KetcherLogger.error('err');
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });

    it('warn() outputs to console.warn', () => {
      KetcherLogger.warn('warn');
      expect(warnSpy).toHaveBeenCalledTimes(1);
    });

    it('info() outputs to console.info', () => {
      KetcherLogger.info('info');
      expect(infoSpy).toHaveBeenCalledTimes(1);
    });

    it('log() outputs to console.log', () => {
      KetcherLogger.log('log');
      expect(logSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('when logging is enabled with level WARN', () => {
    beforeEach(() => {
      setLogging({ enabled: true, level: LogLevel.WARN });
    });

    it('error() outputs to console.error', () => {
      KetcherLogger.error('err');
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });

    it('warn() outputs to console.warn', () => {
      KetcherLogger.warn('warn');
      expect(warnSpy).toHaveBeenCalledTimes(1);
    });

    it('info() is suppressed', () => {
      KetcherLogger.info('info');
      expect(infoSpy).not.toHaveBeenCalled();
    });

    it('log() is suppressed', () => {
      KetcherLogger.log('log');
      expect(logSpy).not.toHaveBeenCalled();
    });
  });

  describe('when logging is enabled with level ERROR only', () => {
    beforeEach(() => {
      setLogging({ enabled: true, level: LogLevel.ERROR });
    });

    it('error() outputs to console.error', () => {
      KetcherLogger.error('err');
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });

    it('warn() is suppressed', () => {
      KetcherLogger.warn('warn');
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });

  describe('when logging is explicitly disabled', () => {
    beforeEach(() => {
      setLogging({ enabled: false, level: LogLevel.LOG });
    });

    it('error() is suppressed', () => {
      KetcherLogger.error('err');
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('warn() is suppressed', () => {
      KetcherLogger.warn('warn');
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('log() is suppressed', () => {
      KetcherLogger.log('log');
      expect(logSpy).not.toHaveBeenCalled();
    });
  });

  describe('showTrace option', () => {
    beforeEach(() => {
      setLogging({
        enabled: true,
        level: LogLevel.LOG,
        showTrace: true,
      } as any);
    });

    it('log() uses console.trace when showTrace is true', () => {
      KetcherLogger.log('trace me');
      expect(traceSpy).toHaveBeenCalledTimes(1);
      expect(logSpy).not.toHaveBeenCalled();
    });

    it('info() uses console.trace when showTrace is true', () => {
      KetcherLogger.info('trace info');
      expect(traceSpy).toHaveBeenCalledTimes(1);
      expect(infoSpy).not.toHaveBeenCalled();
    });
  });
});
