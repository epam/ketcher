export * from './loaders';

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 1000,
  errorMessage: string = 'timeout',
): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs),
  );
  return Promise.race([promise, timeout]);
}
