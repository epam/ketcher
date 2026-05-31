declare module '@rollup/plugin-node-resolve' {
  export interface NodeResolveOptions {
    browser?: boolean;
    dedupe?: string[];
    exportConditions?: string[];
    extensions?: string[];
    jail?: string;
    mainFields?: string[];
    moduleDirectories?: string[];
    modulePaths?: string[];
    modulesOnly?: boolean;
    preferBuiltins?: boolean;
    rootDir?: string;
  }

  const nodeResolve: import('rollup').PluginImpl<NodeResolveOptions>;
  export default nodeResolve;
}

declare module 'rollup-plugin-peer-deps-external' {
  export interface PeerDepsExternalOptions {
    includeDependencies?: boolean;
    packageJsonPath?: string;
  }

  export default function peerDepsExternal(
    options?: PeerDepsExternalOptions,
  ): import('rollup').Plugin;
}

declare module '@svgr/rollup' {
  export interface SvgrOptions {
    babel?: boolean;
    exclude?: string | string[];
    exportType?: 'both' | 'default' | 'named';
    include?: string | string[];
  }

  const svgr: import('rollup').PluginImpl<SvgrOptions>;
  export default svgr;
}

declare module 'rollup-plugin-string' {
  export interface RollupStringOptions {
    exclude?: string | string[];
    include?: string | string[];
  }

  export function string(
    options?: RollupStringOptions,
  ): import('rollup').Plugin;
}
