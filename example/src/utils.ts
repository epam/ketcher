import {
  RemoteStructServiceProvider,
  StructServiceProvider,
} from 'ketcher-core';
import { StandaloneStructServiceProvider } from 'ketcher-standalone/dist/binaryWasm';

export async function getStructServiceProvider() {
  let structServiceProvider: StructServiceProvider =
    new RemoteStructServiceProvider(
      process.env.API_PATH || process.env.REACT_APP_API_PATH,
    );

  if (process.env.MODE === 'standalone') {
    structServiceProvider =
      new StandaloneStructServiceProvider() as StructServiceProvider;
  }

  return structServiceProvider;
}
