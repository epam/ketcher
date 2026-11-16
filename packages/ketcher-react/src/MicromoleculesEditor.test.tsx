import { StrictMode } from 'react';
import { act, render, waitFor } from '@testing-library/react';
import type { Ketcher, StructServiceProvider } from 'ketcher-core';
import { MicromoleculesEditor, type EditorProps } from './MicromoleculesEditor';

// initApp renders the whole editor UI and is not what these tests are about.
// Replacing it keeps everything else real: the init function, KetcherBuilder,
// createApi, and Ketcher. It reports the editor as ready, like the real one
// does once its store has an editor, and returns its cleanup function.
jest.mock('./script/ui', () => ({
  ...jest.requireActual('./script/ui'),
  initApp: jest.fn(
    (
      _prevKetcherId: string,
      _ketcherId: string,
      _element: HTMLDivElement | null,
      _appRoot: unknown,
      _staticResourcesUrl: string,
      _options: unknown,
      _server: unknown,
      resolve: (args: { editor: object; setServer: () => void }) => void,
    ) => {
      resolve({ editor: {}, setServer: jest.fn() });
      return jest.fn();
    },
  ),
}));

// The StructService boundary: every method the editor binds in createApi.
const createFakeStructService = () => ({
  addKetcherId: jest.fn(),
  info: jest.fn().mockResolvedValue({ indigoVersion: '1', imagoVersions: [] }),
  convert: jest.fn(),
  layout: jest.fn(),
  clean: jest.fn(),
  aromatize: jest.fn(),
  dearomatize: jest.fn(),
  calculateCip: jest.fn(),
  automap: jest.fn(),
  check: jest.fn(),
  calculate: jest.fn(),
  recognize: jest.fn(),
  generateImageAsBase64: jest.fn(),
  getInChIKey: jest.fn(),
  toggleExplicitHydrogens: jest.fn(),
  calculateMacromoleculeProperties: jest.fn(),
  destroy: jest.fn(),
});

let services: Array<ReturnType<typeof createFakeStructService>>;
let onInit: jest.Mock<void, [Ketcher]>;

const structServiceProvider = {
  mode: 'standalone',
  createStructService: () => {
    const service = createFakeStructService();
    services.push(service);
    return service;
  },
} as unknown as StructServiceProvider;

// The editor finishes mounting and unmounting in promise callbacks, so both
// run inside an async act.
const renderEditor = async (wrapper?: typeof StrictMode) => {
  let rendered: ReturnType<typeof render> | undefined;
  await act(async () => {
    rendered = render(
      <MicromoleculesEditor
        {...({
          ketcherId: '',
          staticResourcesUrl: '',
          structServiceProvider,
          errorHandler: jest.fn(),
          onInit,
        } as EditorProps)}
      />,
      { wrapper },
    );
  });
  const { unmount } = rendered as ReturnType<typeof render>;
  return {
    unmount: () =>
      act(async () => {
        unmount();
        // A timer fires only after every pending promise callback has run.
        await new Promise((resolve) => setTimeout(resolve, 0));
      }),
  };
};

describe('MicromoleculesEditor struct service lifetime', () => {
  beforeEach(() => {
    services = [];
    onInit = jest.fn();
  });

  it('destroys the struct service when the editor unmounts', async () => {
    const { unmount } = await renderEditor();
    await waitFor(() => expect(onInit).toHaveBeenCalledTimes(1));
    expect(services[0].destroy).not.toHaveBeenCalled();

    await unmount();

    await waitFor(() => expect(services[0].destroy).toHaveBeenCalledTimes(1));
  });

  it('destroys only the struct service of the mount that was torn down under StrictMode', async () => {
    const { unmount } = await renderEditor(StrictMode);

    // StrictMode mounts, unmounts, and mounts again: two services, and the
    // first one belongs to the mount that was torn down.
    await waitFor(() => expect(onInit).toHaveBeenCalledTimes(2));
    expect(services).toHaveLength(2);
    expect(services[0].destroy).toHaveBeenCalledTimes(1);
    expect(services[1].destroy).not.toHaveBeenCalled();

    await unmount();

    await waitFor(() => expect(services[1].destroy).toHaveBeenCalledTimes(1));
    expect(services[0].destroy).toHaveBeenCalledTimes(1);
  });
});
