import { StructServiceProvider } from 'ketcher-core';

export async function getStructServiceProvider() {
  const {
    StandaloneStructServiceProvider,
    // eslint-disable-next-line @typescript-eslint/no-var-requires
  } = require('ketcher-standalone');
  const structServiceProvider: StructServiceProvider =
    new StandaloneStructServiceProvider() as StructServiceProvider;

  return structServiceProvider;
}
