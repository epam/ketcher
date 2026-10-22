import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import {
  type EditorProps,
  MicromoleculesEditor as MicromoleculesEditorComponent,
} from './MicromoleculesEditor';
import { ModeControl } from './script/ui/views/toolbars/ModeControl';
import { LoadingCircles } from './script/ui/views/components';
import styles from './Editor.module.less';
import i18n from './i18n/i18n';
import {
  type Ketcher,
  type Editor as MoleculesEditor,
  type CoreEditor,
  ketcherProvider,
  type MonomerCreationWizardRequest,
} from 'ketcher-core';

type Props = Omit<EditorProps, 'ketcherId'> &
  Pick<
    MacromoleculesEditorProps,
    'monomersLibraryUpdate' | 'monomersLibraryReplace'
  > & {
    disableMacromoleculesEditor?: boolean;
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
  // Subscribes this component to react-i18next's languageChanged event so
  // `dir` below is re-evaluated on a live language switch, not just on next
  // full page load. The hook's `t`/`i18n` return values aren't used here.
  useTranslation();
  const [showPolymerEditor, setShowPolymerEditor] = useState(false);
  const [moleculesEditor, setMoleculesEditor] = useState<MoleculesEditor>();
  const [macromoleculesEditor, setMacromoleculesEditor] =
    useState<CoreEditor>();
  const initializedKetcherRef = useRef<Ketcher | null>(null);

  const [ketcherId, setKetcherId] = useState<string>('');
  const isMacromoleculesEditorEnabled = !disableMacromoleculesEditor;
  const isMacromoleculesEditorTurnedOn =
    isMacromoleculesEditorEnabled && showPolymerEditor;
  const previousModeState = useRef<{
    moleculesEditor: MoleculesEditor;
    macromoleculesEditor: CoreEditor;
    isMacromoleculesEditorTurnedOn: boolean;
  } | null>(null);
  // Refs (not state) so both init callbacks always see the latest instances,
  // regardless of which render they were created in.
  const ketcherRef = useRef<Ketcher | undefined>(undefined);
  const moleculesEditorRef = useRef<MoleculesEditor | undefined>(undefined);
  const macromoleculesEditorRef = useRef<CoreEditor | undefined>(undefined);

  const [isMonomerWizardOpen, setIsMonomerWizardOpen] = useState(false);
  const pendingWizard = useRef<MonomerCreationWizardRequest | undefined>(
    undefined,
  );
  const wizardSessionActive = useRef(false);
  const skipModeConversion = useRef(false);
  const pendingWizardFinish = useRef<boolean | undefined>(undefined);
  const togglePolymerEditor = useCallback(
    (toggleValue: boolean) => {
      const nextValue = isMacromoleculesEditorEnabled && toggleValue;
      setShowPolymerEditor(nextValue);
      window.isPolymerEditorTurnedOn = nextValue;
    },
    [isMacromoleculesEditorEnabled],
  );

  const togglerComponent = isMacromoleculesEditorEnabled ? (
    <ModeControl
      toggle={(value) => {
        if (!isMonomerWizardOpen) togglePolymerEditor(value);
      }}
      isPolymerEditor={isMacromoleculesEditorTurnedOn}
      disabled={isMonomerWizardOpen}
    />
  ) : undefined;

  useEffect(() => {
    const onWizardStateChange = (active: boolean) => {
      setIsMonomerWizardOpen(active || wizardSessionActive.current);
    };
    moleculesEditor?.event.monomerWizardStateChange.add(onWizardStateChange);
    return () => {
      moleculesEditor?.event.monomerWizardStateChange.remove(
        onWizardStateChange,
      );
    };
  }, [moleculesEditor]);

  useEffect(() => {
    const switchToMacromoleculesModeHandler = () => {
      if (wizardSessionActive.current) return;
      togglePolymerEditor(true);
    };
    const switchToMoleculesModeHandler = () => {
      if (wizardSessionActive.current) return;
      togglePolymerEditor(false);
    };
    const openWizardHandler = (request: MonomerCreationWizardRequest) => {
      if (wizardSessionActive.current) return;
      wizardSessionActive.current = true;
      pendingWizard.current = request;
      setIsMonomerWizardOpen(true);
      togglePolymerEditor(false);
    };

    if (macromoleculesEditor && isMacromoleculesEditorEnabled) {
      macromoleculesEditor.events.switchToMacromoleculesMode.add(
        switchToMacromoleculesModeHandler,
      );
      macromoleculesEditor.events.switchToMoleculesMode.add(
        switchToMoleculesModeHandler,
      );
      macromoleculesEditor.events.openMonomerCreationWizard.add(
        openWizardHandler,
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
        macromoleculesEditor.events.openMonomerCreationWizard.remove(
          openWizardHandler,
        );
      }
    };
  }, [
    macromoleculesEditor,
    isMacromoleculesEditorEnabled,
    togglePolymerEditor,
  ]);

  useEffect(() => {
    return () => {
      window.isPolymerEditorTurnedOn = false;
    };
  }, []);

  /*
   * Runs after the macromolecules canvas is shown but before the browser
   * paints, so the rebuilt structures are measured against a laid-out canvas
   * and the user never sees the pre-wizard canvas flash.
   */
  useLayoutEffect(() => {
    const savedCanvas = pendingWizardFinish.current;

    if (savedCanvas === undefined || !macromoleculesEditor) {
      return;
    }

    pendingWizardFinish.current = undefined;

    try {
      macromoleculesEditor.finishMonomerWizardSession(savedCanvas);
    } catch (error) {
      moleculesEditor?.errorHandler?.(
        error instanceof Error ? error.message : String(error),
      );
    }
  }, [showPolymerEditor, macromoleculesEditor, moleculesEditor]);

  useEffect(() => {
    window.isPolymerEditorTurnedOn = isMacromoleculesEditorTurnedOn;
  }, [isMacromoleculesEditorTurnedOn]);

  useLayoutEffect(() => {
    if (!isMacromoleculesEditorEnabled && macromoleculesEditor) {
      // Preserve the structure before the child's passive cleanup destroys its
      // imperative editor. Drop that instance before it can be enabled again.
      macromoleculesEditor.switchToMicromolecules();
      macromoleculesEditorRef.current = undefined;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMacromoleculesEditor(undefined);
    }
  }, [isMacromoleculesEditorEnabled, macromoleculesEditor]);

  /*
   * This effect is synchronization with the DOM, not event handling.
   * The imperative editors must switch only after React has committed the
   * visibility change of their wrappers (display: none -> visible).
   * Moving this logic into togglePolymerEditor was attempted, but it renders
   * into a still-hidden container (zero-size SVG bounding boxes, focus fails),
   * which broke the e2e test that expands monomers in micromolecules mode.
   */
  useEffect(() => {
    if (
      !isMacromoleculesEditorEnabled ||
      !moleculesEditor ||
      !macromoleculesEditor
    ) {
      return;
    }

    const previous = previousModeState.current;
    const sameEditors =
      previous?.moleculesEditor === moleculesEditor &&
      previous.macromoleculesEditor === macromoleculesEditor;
    previousModeState.current = {
      moleculesEditor,
      macromoleculesEditor,
      isMacromoleculesEditorTurnedOn,
    };

    // Readiness alone must not steal focus on the initial hidden mount. An
    // editor replacement in visible macro mode still needs its own conversion.
    if (
      (!sameEditors && !isMacromoleculesEditorTurnedOn) ||
      (sameEditors &&
        previous.isMacromoleculesEditorTurnedOn ===
          isMacromoleculesEditorTurnedOn)
    ) {
      return;
    }

    if (skipModeConversion.current) {
      skipModeConversion.current = false;
      return;
    }

    const request = pendingWizard.current;
    if (request) {
      pendingWizard.current = undefined;
      /*
       * Only schedules the restore: rebuilding the macromolecules canvas
       * measures the DOM (monomer labels are laid out from getBBox), and
       * that canvas is still hidden until React re-renders in macro mode.
       * The layout effect above performs it once the canvas is on screen.
       */
      const finishSession = (savedCanvas: boolean) => {
        wizardSessionActive.current = false;
        skipModeConversion.current = true;
        pendingWizardFinish.current = savedCanvas;
        setIsMonomerWizardOpen(false);
        togglePolymerEditor(true);
      };
      try {
        moleculesEditor.openMonomerCreationWizardFromMacro(
          request,
          finishSession,
        );
      } catch (error) {
        // Roll back the imperative transition if opening the wizard failed.
        if (wizardSessionActive.current) finishSession(false);
        moleculesEditor.errorHandler?.(
          error instanceof Error ? error.message : String(error),
        );
      }
      return;
    }

    if (!isMacromoleculesEditorTurnedOn) {
      macromoleculesEditor.switchToMicromolecules();
      moleculesEditor.focusCliparea();
      return;
    }

    moleculesEditor.closeMonomerCreationWizard?.();

    // switchToMacromolecules needs the library to convert the struct.
    let cancelled = false;

    macromoleculesEditor.ensureDefaultMonomersLibraryLoaded().then(() => {
      if (!cancelled) {
        macromoleculesEditor.switchToMacromolecules();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [
    isMacromoleculesEditorEnabled,
    isMacromoleculesEditorTurnedOn,
    moleculesEditor,
    macromoleculesEditor,
    togglePolymerEditor,
  ]);

  // Called from both init callbacks. The editors initialize asynchronously in
  // no guaranteed order, so onInit fires on whichever call finds both ready
  // (or only the molecules editor, if macromolecules is disabled).
  const notifyInitIfReady = () => {
    const ketcher = ketcherRef.current;
    if (
      !ketcher ||
      !moleculesEditorRef.current ||
      !(macromoleculesEditorRef.current || disableMacromoleculesEditor)
    ) {
      return;
    }

    // After analysis, we identified potential risks in removing either check:
    // 1. Without ID check: Risk of race conditions if onInit is called before the instance is registered in ketcherProvider.
    // 2. Without Reference check: Risk of system desync if a new instance theoretically reuses an old ID.
    // We keep both to ensure the consumer is initialized only when the instance is both registered AND uniquely new.
    if (
      onInit &&
      ketcherProvider.getIndexById(ketcher.id) !== -1 &&
      initializedKetcherRef.current !== ketcher
    ) {
      initializedKetcherRef.current = ketcher;
      onInit?.(ketcher);
    }
  };

  const onInitMoleculesEditor = (ketcher: Ketcher) => {
    ketcherRef.current = ketcher;
    moleculesEditorRef.current = ketcher.editor;
    setMoleculesEditor(ketcher.editor);
    notifyInitIfReady();
  };

  const onInitMacromoleculesEditor = (macromoleculesEditor: CoreEditor) => {
    macromoleculesEditorRef.current = macromoleculesEditor;
    setMacromoleculesEditor(macromoleculesEditor);
    notifyInitIfReady();
  };

  return (
    <I18nextProvider i18n={i18n}>
      <div dir={i18n.dir()} className={styles.root}>
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
            display: isMacromoleculesEditorTurnedOn ? 'none' : undefined,
          }}
        >
          <MicromoleculesEditorComponent
            {...restProps}
            ketcherId={ketcherId}
            onSetKetcherId={setKetcherId}
            togglerComponent={togglerComponent}
            onInit={onInitMoleculesEditor}
          />
        </div>
      </div>
    </I18nextProvider>
  );
};
