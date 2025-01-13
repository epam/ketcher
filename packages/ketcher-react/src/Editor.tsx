import { lazy, startTransition, StrictMode, Suspense, useState } from 'react';
import { Editor as MicroEditor, EditorProps } from './MicroEditor';
import { ModeControl } from './script/ui/views/toolbars/ModeControl';

type Props = EditorProps & {
  macromoleculesDisabled?: boolean;
};

/*
 * TODO:
 *  ketcher-macromolecules is imported asynchronously to avoid circular dependencies between it and ketcher-react
 *  and ts-ignore is needed to avoid TypeScript error as ketcher-react is built first
 *  so ketcher-macromolecules can't provide any typings while building ketcher-react.
 *  Consider refactoring/restructuring packages to avoid these two issues
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const Macromolecules = lazy(() => import('ketcher-macromolecules'));

export const Editor = (props: Props) => {
  const [showPolymerEditor, setShowPolymerEditor] = useState(false);

  const togglePolymerEditor = (toggleValue: boolean) => {
    startTransition(() => {
      setShowPolymerEditor(toggleValue);
      window.isPolymerEditorTurnedOn = toggleValue;
    });
  };

  const togglerComponent = !props.macromoleculesDisabled ? (
    <ModeControl
      toggle={togglePolymerEditor}
      isPolymerEditor={showPolymerEditor}
    />
  ) : undefined;

  return (
    <StrictMode>
      {showPolymerEditor ? (
        <Suspense fallback={<div>Loading...</div>}>
          <Macromolecules togglerComponent={togglerComponent} />
        </Suspense>
      ) : (
        <MicroEditor {...props} togglerComponent={togglerComponent} />
      )}
    </StrictMode>
  );
};
