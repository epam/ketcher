import { RemoteStructService } from '../remoteStructService';

describe('RemoteStructService custom headers error handling', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('rejects the returned promise instead of throwing synchronously when fetch throws (e.g. invalid custom headers)', () => {
    global.fetch = jest.fn(() => {
      throw new TypeError('Invalid value');
    }) as unknown as typeof fetch;

    const service = new RemoteStructService(
      'http://localhost:8002/v2/',
      {},
      { 'Invalid Header': 'oops' },
    );

    let thrownSynchronously = false;
    let result: Promise<unknown> | undefined;
    try {
      result = service.check({ struct: 'C', types: [] }, undefined);
    } catch {
      thrownSynchronously = true;
    }

    expect(thrownSynchronously).toBe(false);
    expect(result).toBeInstanceOf(Promise);
    return expect(result).rejects.toThrow(
      /Invalid custom headers passed to RemoteStructServiceProvider/,
    );
  });
});
