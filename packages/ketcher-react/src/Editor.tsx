import { lazy, Suspense, useEffect, useState } from 'react';
import {
  MicromoleculesEditor as MicromoleculesEditorComponent,
  EditorProps,
} from './MicromoleculesEditor';
import { ModeControl } from './script/ui/views/toolbars/ModeControl';
import { LoadingCircles } from './script/ui/views/components';
import styles from './Editor.module.less';
import { Ketcher, Editor as MoleculesEditor, CoreEditor } from 'ketcher-core';

type Props = Omit<EditorProps, 'ketcherId'> & {
  disableMacromoleculesEditor?: boolean;
};

interface MacromoleculesEditorProps {
  ketcherId: string;
  togglerComponent?: JSX.Element;
  isMacromoleculesEditorTurnedOn?: boolean;
  onInit(macromoleculesEditor: CoreEditor): void;
}
/*
 * TODO:
 *  ketcher-macromolecules is imported asynchronously to avoid circular dependencies between it and ketcher-react
 *  and ts-ignore is needed to avoid TypeScript error as ketcher-react is built first
 *  so ketcher-macromolecules can't provide any typings while building ketcher-react.
 *  Consider refactoring/restructuring packages to avoid these two issues
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const MacromoleculesEditorComponent = lazy(
  () => import('ketcher-macromolecules'),
) as unknown as React.LazyExoticComponent<
  React.ComponentType<MacromoleculesEditorProps>
>;

export const Editor = (props: Props) => {
  const [showPolymerEditor, setShowPolymerEditor] = useState(false);
  const [moleculesEditor, setMoleculesEditor] = useState<MoleculesEditor>();
  const [macromoleculesEditor, setMacromoleculesEditor] =
    useState<CoreEditor>();

  const [ketcherId, setKetcherId] = useState<string>('');
  const togglePolymerEditor = (toggleValue: boolean) => {
    setShowPolymerEditor(toggleValue);
    window.isPolymerEditorTurnedOn = toggleValue;
  };

  const togglerComponent = !props.disableMacromoleculesEditor ? (
    <ModeControl
      toggle={togglePolymerEditor}
      isPolymerEditor={showPolymerEditor}
    />
  ) : undefined;

  useEffect(() => {
    return () => {
      window.isPolymerEditorTurnedOn = false;
    };
  }, []);

  useEffect(() => {
    if (moleculesEditor && macromoleculesEditor) {
      if (showPolymerEditor) {
        macromoleculesEditor?.switchToMacromolecules();
      } else {
        macromoleculesEditor?.switchToMicromolecules();
        moleculesEditor?.focusCliparea();
      }
    }
  }, [showPolymerEditor]);

  const onInitMoleculesEditor = (ketcher: Ketcher) => {
    props.onInit?.(ketcher);
    setMoleculesEditor(ketcher.editor);
  };

  const onInitMacromoleculesEditor = (macromoleculesEditor: CoreEditor) => {
    setMacromoleculesEditor(macromoleculesEditor);
  };

  return (
    <>
      <div
        className={styles.editorsWrapper}
        style={{
          display: showPolymerEditor ? undefined : 'none',
        }}
      >
        <Suspense
          fallback={
            <div className={styles.switchingLoader}>
              <LoadingCircles />
            </div>
          }
        >
          {ketcherId && (
            <MacromoleculesEditorComponent
              togglerComponent={togglerComponent}
              ketcherId={ketcherId}
              isMacromoleculesEditorTurnedOn={showPolymerEditor}
              onInit={onInitMacromoleculesEditor}
            />
          )}
        </Suspense>
      </div>
      <div
        className={styles.editorsWrapper}
        style={{
          display: showPolymerEditor ? 'none' : undefined,
        }}
      >
        <MicromoleculesEditorComponent
          {...props}
          ketcherId={ketcherId}
          onSetKetcherId={setKetcherId}
          togglerComponent={togglerComponent}
          onInit={onInitMoleculesEditor}
        />
      </div>
    </>
  );
};
