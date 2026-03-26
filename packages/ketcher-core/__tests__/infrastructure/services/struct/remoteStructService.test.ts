import { ketcherProvider } from 'application/utils';
import { RemoteStructService } from 'infrastructure/services/struct/remoteStructService';

describe('RemoteStructService.generateImageAsBase64', () => {
  const ketcherId = 'test-ketcher-id';
  const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>(
    async () => {
      return {
        text: async () => 'base64-image',
      } as unknown as Response;
    },
  );

  beforeEach(() => {
    global.fetch = fetchMock as unknown as typeof fetch;
    fetchMock.mockClear();
    ketcherProvider.addKetcherInstance({
      id: ketcherId,
      editor: {
        options: () => ({
          ignoreChiralFlag: false,
        }),
      },
    } as never);
  });

  afterEach(() => {
    ketcherProvider.removeKetcherInstance(ketcherId);
  });

  it('should pass font to Indigo render options', async () => {
    const service = new RemoteStructService('/api/', {});

    service.addKetcherId(ketcherId);

    await service.generateImageAsBase64('ket-struct', {
      outputFormat: 'svg',
      font: '24px Helvetica',
    });

    const requestInit = fetchMock.mock.calls[0]?.[1];

    expect(requestInit).toBeDefined();

    if (!requestInit) {
      throw new Error('Expected fetch to be called with request options');
    }

    const requestBody = JSON.parse(requestInit.body as string);

    expect(requestBody.options).toEqual(
      expect.objectContaining({
        font: '24px Helvetica',
        'render-output-format': 'svg',
      }),
    );
  });
});
