declare module 'ketcher-macromolecules' {
  import type * as React from 'react';
  import type { MacromoleculesEditorProps } from 'ketcher-core';
  const MacromoleculesEditor: React.ComponentType<
    MacromoleculesEditorProps<React.ReactElement>
  >;
  export default MacromoleculesEditor;
}
