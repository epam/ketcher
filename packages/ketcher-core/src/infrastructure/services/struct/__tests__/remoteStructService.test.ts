import { RemoteStructService } from '../remoteStructService';

describe('RemoteStructService', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  test('recognize() polls imago/uploads using the raw id without replacing port with placeholder', async () => {
    const calls: string[] = [];

    global.fetch = jest.fn((input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();
      calls.push(url);

      if (url.includes('imago/uploads') && !url.includes('/imago/uploads/')) {
        // POST to uploads
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ upload_id: 'abc' }),
        } as Response);
      }

      if (url.includes('/imago/uploads/abc')) {
        // GET poll status
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              state: 'SUCCESS',
              metadata: { mol_str: 'C' },
            }),
        } as Response);
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);
    }) as jest.Mock;

    const service = new RemoteStructService(
      'http://127.0.0.1:9321/v2/',
      {} as unknown as ConstructorParameters<typeof RemoteStructService>[1],
    );
    const blob = new Blob(['dummy'], { type: 'image/png' });

    const result = await service.recognize(blob, '');

    expect(result).toEqual({ struct: 'C' });
    expect(calls.length).toBeGreaterThanOrEqual(2);
    expect(calls[1]).toBe('http://127.0.0.1:9321/v2/imago/uploads/abc');
  });
});
