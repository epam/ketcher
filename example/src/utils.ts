import {
  RemoteStructServiceProvider,
  StructServiceProvider,
} from 'ketcher-core';

export async function getStructServiceProvider() {
  let structServiceProvider: StructServiceProvider =
    new RemoteStructServiceProvider(
      process.env.API_PATH || process.env.REACT_APP_API_PATH,
    );

  if (process.env.MODE === 'standalone') {
    const { StandaloneStructServiceProvider } = await import(
      'ketcher-standalone'
    );
    structServiceProvider =
      new StandaloneStructServiceProvider() as StructServiceProvider;
  }

  return structServiceProvider;
}
