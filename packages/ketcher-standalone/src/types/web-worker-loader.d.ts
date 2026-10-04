declare module 'web-worker:*' {
  const WebWorkerFactory: new () => Worker;

  export default WebWorkerFactory;
}
