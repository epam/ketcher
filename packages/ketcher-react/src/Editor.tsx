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
  monomersLibraryUpdate?: string | JSON;
  monomersLibraryReplace?: string | JSON;
};

interface MacromoleculesEditorProps {
  ketcherId: string;
  togglerComponent?: JSX.Element;
  isMacromoleculesEditorTurnedOn?: boolean;
  monomersLibraryUpdate?: string | JSON;
  monomersLibraryReplace?: string | JSON;
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
  const [ketcher, setKetcher] = useState<Ketcher>();
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
    const switchToMacromoleculesModeHandler = () => {
      togglePolymerEditor(true);
    };
    const switchToMoleculesModeHandler = () => {
      togglePolymerEditor(false);
    };

    if (macromoleculesEditor) {
      macromoleculesEditor.events.switchToMacromoleculesMode.add(
        switchToMacromoleculesModeHandler,
      );
      macromoleculesEditor.events.switchToMoleculesMode.add(
        switchToMoleculesModeHandler,
      );
    }

    return () => {
      if (macromoleculesEditor) {
        macromoleculesEditor.events.switchToMacromoleculesMode.remove(
          switchToMacromoleculesModeHandler,
        );
        macromoleculesEditor.events.switchToMoleculesMode.remove(
          switchToMoleculesModeHandler,
        );
      }
    };
  }, [macromoleculesEditor]);

  useEffect(() => {
    return () => {
      window.isPolymerEditorTurnedOn = false;
    };
  }, []);

  useEffect(() => {
    if (moleculesEditor && macromoleculesEditor) {
      if (showPolymerEditor) {
        moleculesEditor?.closeMonomerCreationWizard?.();
        macromoleculesEditor?.switchToMacromolecules();
      } else {
        macromoleculesEditor?.switchToMicromolecules();
        moleculesEditor?.focusCliparea();
      }
    }
  }, [showPolymerEditor]);

  useEffect(() => {
    if (
      ketcher &&
      moleculesEditor &&
      (macromoleculesEditor || props.disableMacromoleculesEditor)
    ) {
      props.onInit?.(ketcher);
    }
  }, [moleculesEditor, macromoleculesEditor]);

  const onInitMoleculesEditor = (ketcher: Ketcher) => {
    setKetcher(ketcher);
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
              monomersLibraryUpdate={props.monomersLibraryUpdate}
              monomersLibraryReplace={props.monomersLibraryReplace}
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
