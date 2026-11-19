// Vite's native inline-worker import, used by useViteInlineWorker.ts. Declared
// locally rather than pulling in `vite/client`, which would also add DOM/env
// globals this package does not use.
declare module '*?worker&inline' {
  const WorkerConstructor: new () => Worker;

  export default WorkerConstructor;
}
