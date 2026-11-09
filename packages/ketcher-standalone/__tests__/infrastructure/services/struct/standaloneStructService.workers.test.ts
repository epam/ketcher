import { Command } from '../../../../src/infrastructure/services/struct/indigoWorker.types';
import type StandaloneStructServiceClass from '../../../../src/infrastructure/services/struct/standaloneStructService';

// The browser's Worker is the system boundary. Everything else - the service
// and the worker shim that decides how many workers exist - stays real.
// useNativeWorkerUrl is the shim the example's production build uses;
// useViteInlineWorker has the same shape but cannot load under Jest because it
// needs Vite's `?worker&inline` import.
jest.mock('_indigo-worker-import-alias_', () =>
  jest.requireActual(
    '../../../../src/infrastructure/services/struct/indigoWorkerImports/useNativeWorkerUrl',
  ),
);

type MessageListener = (event: MessageEvent) => void;

// Behaves like the Indigo worker for the one command these tests use: it
// answers every `info` it receives, unless it was terminated.
class FakeIndigoWorker {
  static instances: FakeIndigoWorker[] = [];

  onmessage: MessageListener | null = null;
  terminated = false;
  private readonly listeners = new Set<MessageListener>();

  constructor() {
    FakeIndigoWorker.instances.push(this);
  }

  addEventListener(type: string, listener: MessageListener) {
    if (type === 'message') this.listeners.add(listener);
  }

  removeEventListener(type: string, listener: MessageListener) {
    if (type === 'message') this.listeners.delete(listener);
  }

  postMessage(message: { type: Command }) {
    if (this.terminated || message.type !== Command.Info) return;
    queueMicrotask(() => this.reply());
  }

  terminate() {
    this.terminated = true;
    this.onmessage = null;
    this.listeners.clear();
  }

  private reply() {
    if (this.terminated) return;
    const event = {
      data: { type: Command.Info, payload: '1.0.0', hasError: false },
    } as MessageEvent;
    this.onmessage?.(event);
    this.listeners.forEach((listener) => listener(event));
  }
}

// A fresh module registry per test: the shim may keep a worker in module
// state, and that must not leak from one test into the next.
function loadService(): typeof StandaloneStructServiceClass {
  let service: typeof StandaloneStructServiceClass | undefined;
  jest.isolateModules(() => {
    service = jest.requireActual(
      '../../../../src/infrastructure/services/struct/standaloneStructService',
    ).default;
  });
  return service as typeof StandaloneStructServiceClass;
}

// Resolves to whether `promise` has settled once all work that does not wait
// on the 30 s worker timeout has run.
async function settles(promise: Promise<unknown>) {
  let settled = false;
  promise.then(
    () => (settled = true),
    () => (settled = true),
  );
  await jest.advanceTimersByTimeAsync(100);
  return settled;
}

describe('StandaloneStructService with several services on one page', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    FakeIndigoWorker.instances = [];
    Object.assign(globalThis, {
      Worker: FakeIndigoWorker,
      // Node has no window; the service announces "Indigo is ready" on it.
      dispatchEvent: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('answers info() of every service, as two editors on one page create two services', async () => {
    const StandaloneStructService = loadService();
    const first = new StandaloneStructService({});
    const second = new StandaloneStructService({});

    const firstInfo = first.info();
    const secondInfo = second.info();

    expect(await settles(firstInfo)).toBe(true);
    expect(await settles(secondInfo)).toBe(true);
  });

  it('keeps a service working after another one is destroyed', async () => {
    const StandaloneStructService = loadService();
    const first = new StandaloneStructService({});
    const second = new StandaloneStructService({});

    first.destroy();

    expect(await settles(second.info())).toBe(true);
  });
});
