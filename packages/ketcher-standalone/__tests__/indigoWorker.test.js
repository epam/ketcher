import { Command } from '../src/infrastructure/services/struct/indigoWorker.types';

describe('Indigo worker embind ownership', () => {
  let options;
  let vector;
  let indigo;
  const originalOnmessage = globalThis.onmessage;
  const originalPostMessage = globalThis.postMessage;

  beforeEach(() => {
    options = { set: jest.fn(), delete: jest.fn() };
    vector = { push_back: jest.fn(), delete: jest.fn() };
    indigo = {
      MapStringString: jest.fn(() => options),
      VectorInt: jest.fn(() => vector),
      convert: jest.fn(() => 'converted'),
      calculate: jest.fn(() => '{"mass":42}'),
      clean2d: jest.fn(() => 'cleaned'),
    };
    globalThis.postMessage = jest.fn();
    jest.resetModules();
    jest.doMock(
      '_indigo-ketcher-import-alias_',
      () => ({ __esModule: true, default: () => Promise.resolve(indigo) }),
      { virtual: true },
    );
    require('../src/infrastructure/services/struct/indigoWorker');
  });

  afterEach(() => {
    globalThis.onmessage = originalOnmessage;
    globalThis.postMessage = originalPostMessage;
  });

  async function send(type, data) {
    globalThis.onmessage({ data: { type, data } });
    await Promise.resolve();
    expect(globalThis.postMessage).toHaveBeenCalledTimes(1);
    expect(options.delete).toHaveBeenCalledTimes(1);
    return globalThis.postMessage.mock.calls[0][0];
  }

  const conversion = {
    struct: 'C',
    format: 'ket',
    options: { monomerLibrary: 'library', enabled: true, omitted: undefined },
  };

  it('releases the options map and preserves conversion output and options', async () => {
    expect(await send(Command.Convert, conversion)).toEqual({
      type: Command.Convert,
      payload: 'converted',
      hasError: false,
      inputData: 'C',
    });
    expect(options.set.mock.calls).toEqual([
      ['monomerLibrary', 'library'],
      ['enabled', 'true'],
    ]);
    expect(indigo.convert).toHaveBeenCalledWith('C', 'ket', options);
  });

  it.each([new Error('conversion failed'), 'conversion failed'])(
    'releases the options map on handler failure (%p)',
    async (error) => {
      indigo.convert.mockImplementation(() => {
        throw error;
      });
      expect(await send(Command.Convert, conversion)).toEqual({
        type: Command.Convert,
        hasError: true,
        error: 'conversion failed',
        inputData: 'C',
      });
    },
  );

  it('releases the options map and posts an error when option population fails', async () => {
    options.set.mockImplementation(() => {
      throw new Error('option failed');
    });
    expect(await send(Command.Convert, conversion)).toEqual({
      type: Command.Convert,
      hasError: true,
      error: 'option failed',
      inputData: 'C',
    });
    expect(indigo.convert).not.toHaveBeenCalled();
  });

  describe.each([
    [Command.Calculate, 'calculate', '{"mass":42}'],
    [Command.Clean, 'clean2d', 'cleaned'],
  ])('selection command %s', (type, method, payload) => {
    const data = { struct: 'CC', format: 'ket', selectedAtoms: [0, 1] };

    it('releases the vector once and preserves the success response', async () => {
      expect(await send(type, data)).toEqual({
        type,
        payload,
        hasError: false,
        inputData: undefined,
      });
      expect(vector.push_back.mock.calls).toEqual([[0], [1]]);
      expect(indigo[method]).toHaveBeenCalledWith(
        ...(type === Command.Clean
          ? ['CC', 'ket', options, vector]
          : ['CC', options, vector]),
      );
      expect(vector.delete).toHaveBeenCalledTimes(1);
    });

    it.each(['population', 'Indigo call'])(
      'releases the vector once when %s fails',
      async (failure) => {
        const failingMock =
          failure === 'population' ? vector.push_back : indigo[method];
        failingMock.mockImplementation(() => {
          throw new Error('selection failed');
        });
        expect(await send(type, data)).toEqual({
          type,
          hasError: true,
          error: 'selection failed',
          inputData: undefined,
        });
        expect(vector.delete).toHaveBeenCalledTimes(1);
        if (failure === 'population') {
          expect(indigo[method]).not.toHaveBeenCalled();
        }
      },
    );
  });
});
