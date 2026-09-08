// Type declaration for modules imported via rollup-plugin-web-worker-loader
// The 'web-worker:' prefix is a special syntax handled by the rollup plugin at build time
declare module 'web-worker:*' {
  const WorkerConstructor: new () => Worker;
  export default WorkerConstructor;
}
