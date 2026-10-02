/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-you-might-not-need-an-effect/no-event-handler */
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import {
  type EditorProps,
  MicromoleculesEditor as MicromoleculesEditorComponent,
} from './MicromoleculesEditor';
import { ModeControl } from './script/ui/views/toolbars/ModeControl';
import { LoadingCircles } from './script/ui/views/components';
import styles from './Editor.module.less';
import {
  type Ketcher,
  type Editor as MoleculesEditor,
  type CoreEditor,
  type MacromoleculesEditorProps,
  ketcherProvider,
} from 'ketcher-core';

type Props = Omit<EditorProps, 'ketcherId'> &
  Pick<
    MacromoleculesEditorProps,
    'monomersLibraryUpdate' | 'monomersLibraryReplace'
  > & {
    disableMacromoleculesEditor?: boolean;
  };

/*
 * TODO:
 *  ketcher-macromolecules is imported asynchronously to avoid circular dependencies between it and ketcher-react
 *  and ts-ignore is needed to avoid TypeScript error as ketcher-react is built first
 *  so ketcher-macromolecules can't provide any typings while building ketcher-react.
 *  Consider refactoring/restructuring packages to avoid these two issues
 *
 *  NOTE: The circular dependency check (test:circ) uses --skip-dynamic-imports tree so that dpdm does not
 *  traverse this dynamic import. If this import is ever changed to a static one, the flag must be removed
 *  and the resulting cross-package cycle (ketcher-macromolecules -> ketcher-react) must be resolved first.
 */

// @ts-ignore ketcher-macromolecules is not available during ketcher-react build (dynamic import)
const MacromoleculesEditorComponent = lazy(
  () => import('ketcher-macromolecules'),
) as unknown as React.LazyExoticComponent<
  React.ComponentType<MacromoleculesEditorProps<JSX.Element>>
>;

export const Editor = (props: Props) => {
  const [showPolymerEditor, setShowPolymerEditor] = useState(false);
  const [moleculesEditor, setMoleculesEditor] = useState<MoleculesEditor>();
  const [ketcher, setKetcher] = useState<Ketcher>();
  const [macromoleculesEditor, setMacromoleculesEditor] =
    useState<CoreEditor>();
  const initializedKetcherId = useRef<string | undefined>(undefined);

  const [ketcherId, setKetcherId] = useState<string>('');
  const isMacromoleculesEditorEnabled = !props.disableMacromoleculesEditor;
  const isMacromoleculesEditorTurnedOn =
    isMacromoleculesEditorEnabled && showPolymerEditor;

  const togglePolymerEditor = (toggleValue: boolean) => {
    const nextValue = isMacromoleculesEditorEnabled && toggleValue;
    setShowPolymerEditor(nextValue);
    window.isPolymerEditorTurnedOn = nextValue;
  };

  const togglerComponent = isMacromoleculesEditorEnabled ? (
    <ModeControl
      toggle={togglePolymerEditor}
      isPolymerEditor={isMacromoleculesEditorTurnedOn}
    />
  ) : undefined;

  useEffect(() => {
    const switchToMacromoleculesModeHandler = () => {
      togglePolymerEditor(true);
    };
    const switchToMoleculesModeHandler = () => {
      togglePolymerEditor(false);
    };

    if (macromoleculesEditor && isMacromoleculesEditorEnabled) {
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
  }, [macromoleculesEditor, isMacromoleculesEditorEnabled]);

  useEffect(() => {
    return () => {
      window.isPolymerEditorTurnedOn = false;
    };
  }, []);

  useEffect(() => {
    window.isPolymerEditorTurnedOn = isMacromoleculesEditorTurnedOn;
  }, [isMacromoleculesEditorTurnedOn]);

  useEffect(() => {
    if (!moleculesEditor || !macromoleculesEditor) {
      return;
    }

    if (!isMacromoleculesEditorTurnedOn) {
      macromoleculesEditor.switchToMicromolecules();
      moleculesEditor.focusCliparea();
      return;
    }

    moleculesEditor.closeMonomerCreationWizard?.();

    // The default monomers library is a lazily fetched asset, so it may not be
    // resolved yet. switchToMacromolecules converts the struct into drawing
    // entities and needs the library present, so wait for it before switching.
    // ensureDefaultMonomersLibraryLoaded is idempotent, so only the first
    // switch actually fetches.
    let cancelled = false;

    macromoleculesEditor.ensureDefaultMonomersLibraryLoaded().then(() => {
      if (!cancelled) {
        macromoleculesEditor.switchToMacromolecules();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isMacromoleculesEditorTurnedOn]);

  useEffect(() => {
    if (
      ketcher &&
      moleculesEditor &&
      (macromoleculesEditor || props.disableMacromoleculesEditor)
    ) {
      if (
        props.onInit &&
        initializedKetcherId.current !== ketcher.id &&
        ketcherProvider.getIndexById(ketcher.id) !== -1
      ) {
        props.onInit(ketcher);
        initializedKetcherId.current = ketcher.id;
      }
    }
  }, [
    moleculesEditor,
    macromoleculesEditor,
    props.disableMacromoleculesEditor,
  ]);

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
        data-ketcher-editor
        className={styles.editorsWrapper}
        style={{
          display: isMacromoleculesEditorTurnedOn ? undefined : 'none',
        }}
      >
        <Suspense
          fallback={
            <div className={styles.switchingLoader}>
              <LoadingCircles />
            </div>
          }
        >
          {ketcherId && isMacromoleculesEditorEnabled && (
            <MacromoleculesEditorComponent
              togglerComponent={togglerComponent}
              ketcherId={ketcherId}
              isMacromoleculesEditorTurnedOn={isMacromoleculesEditorTurnedOn}
              monomersLibraryUpdate={props.monomersLibraryUpdate}
              monomersLibraryReplace={props.monomersLibraryReplace}
              onInit={onInitMacromoleculesEditor}
            />
          )}
        </Suspense>
      </div>
      <div
        data-ketcher-editor
        className={styles.editorsWrapper}
        style={{
          display: isMacromoleculesEditorTurnedOn ? 'none' : undefined,
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
