import {
  RemoteStructServiceProvider,
  StructServiceProvider,
} from 'ketcher-core';

export function getStructServiceProvider() {
  let structServiceProvider: StructServiceProvider =
    new RemoteStructServiceProvider(
      process.env.API_PATH || process.env.REACT_APP_API_PATH,
    );

  if (process.env.MODE === 'standalone') {
    const {
      StandaloneStructServiceProvider,
      // eslint-disable-next-line @typescript-eslint/no-var-requires
    } = require('ketcher-standalone');
    structServiceProvider =
      new StandaloneStructServiceProvider() as StructServiceProvider;
  }

  return structServiceProvider;
}
