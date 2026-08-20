import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
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
  ketcherProvider,
} from 'ketcher-core';

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
 *
 *  NOTE: The circular dependency check (test:circ) uses --skip-dynamic-imports tree so that dpdm does not
 *  traverse this dynamic import. If this import is ever changed to a static one, the flag must be removed
 *  and the resulting cross-package cycle (ketcher-macromolecules -> ketcher-react) must be resolved first.
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore ketcher-macromolecules is not available during ketcher-react build (dynamic import)
const MacromoleculesEditorComponent = lazy(
  () => import('ketcher-macromolecules'),
) as unknown as React.LazyExoticComponent<
  React.ComponentType<MacromoleculesEditorProps>
>;

export const Editor = (props: Props) => {
  const {
    onInit,
    disableMacromoleculesEditor,
    monomersLibraryUpdate,
    monomersLibraryReplace,
    ...restProps
  } = props;
  const [showPolymerEditor, setShowPolymerEditor] = useState(false);
  const [moleculesEditor, setMoleculesEditor] = useState<MoleculesEditor>();
  const [ketcher, setKetcher] = useState<Ketcher>();
  const [macromoleculesEditor, setMacromoleculesEditor] =
    useState<CoreEditor>();

  const [ketcherId, setKetcherId] = useState<string>('');
  const calledForIdRef = useRef<string | null>(null);
  const prevShowPolymerEditorRef = useRef<boolean>(showPolymerEditor);
  const editorsReadyRef = useRef<boolean>(false);

  const togglePolymerEditor = useCallback((toggleValue: boolean) => {
    setShowPolymerEditor(toggleValue);
    window.isPolymerEditorTurnedOn = toggleValue;
  }, []);

  const togglerComponent = !disableMacromoleculesEditor ? (
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
  }, [macromoleculesEditor, togglePolymerEditor]);

  useEffect(() => {
    return () => {
      window.isPolymerEditorTurnedOn = false;
    };
  }, []);

  useEffect(() => {
    // Guard to prevent running on initial lazy-load mount when editors become ready
    // and showPolymerEditor is false, to avoid unexpected focus shifts
    if (moleculesEditor && macromoleculesEditor) {
      // Mark editors as ready once
      if (!editorsReadyRef.current) {
        editorsReadyRef.current = true;
        prevShowPolymerEditorRef.current = showPolymerEditor;
        return;
      }

      // Only proceed if showPolymerEditor actually changed
      if (prevShowPolymerEditorRef.current === showPolymerEditor) {
        prevShowPolymerEditorRef.current = showPolymerEditor;
        return;
      }

      prevShowPolymerEditorRef.current = showPolymerEditor;

      if (showPolymerEditor) {
        moleculesEditor?.closeMonomerCreationWizard?.();
        macromoleculesEditor?.switchToMacromolecules();
      } else {
        macromoleculesEditor?.switchToMicromolecules();
        moleculesEditor?.focusCliparea();
      }
    }
  }, [showPolymerEditor, moleculesEditor, macromoleculesEditor]);

  useEffect(() => {
    if (
      ketcher &&
      moleculesEditor &&
      (macromoleculesEditor || disableMacromoleculesEditor)
    ) {
      if (
        ketcherProvider.getIndexById(ketcher.id) !== -1 &&
        calledForIdRef.current !== ketcher.id
      ) {
        calledForIdRef.current = ketcher.id;
        onInit?.(ketcher);
      }
    }

    // Note: We intentionally don't reset calledForIdRef in cleanup
    // to avoid duplicate calls when deps change
  }, [
    ketcher,
    moleculesEditor,
    macromoleculesEditor,
    onInit,
    disableMacromoleculesEditor,
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
              monomersLibraryUpdate={monomersLibraryUpdate}
              monomersLibraryReplace={monomersLibraryReplace}
              onInit={onInitMacromoleculesEditor}
            />
          )}
        </Suspense>
      </div>
      <div
        data-ketcher-editor
        className={styles.editorsWrapper}
        style={{
          display: showPolymerEditor ? 'none' : undefined,
        }}
      >
        <MicromoleculesEditorComponent
          {...restProps}
          ketcherId={ketcherId}
          onSetKetcherId={setKetcherId}
          togglerComponent={togglerComponent}
          onInit={onInitMoleculesEditor}
          disableMacromoleculesEditor={disableMacromoleculesEditor}
          monomersLibraryUpdate={monomersLibraryUpdate}
          monomersLibraryReplace={monomersLibraryReplace}
        />
      </div>
    </>
  );
};
