/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-you-might-not-need-an-effect/no-event-handler */
import {
  lazy,
  Suspense,
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
  type MacromoleculesEditorProps,
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
  // Subscribes this component to react-i18next's languageChanged event so
  // `dir` below is re-evaluated on a live language switch, not just on next
  // full page load. The hook's `t`/`i18n` return values aren't used here.
  useTranslation();
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

  const [isMonomerWizardOpen, setIsMonomerWizardOpen] = useState(false);
  const pendingWizard = useRef<MonomerCreationWizardRequest | undefined>(
    undefined,
  );
  const wizardSessionActive = useRef(false);
  const skipModeConversion = useRef(false);
  const pendingWizardFinish = useRef<boolean | undefined>(undefined);
  const togglePolymerEditor = (toggleValue: boolean) => {
    const nextValue = isMacromoleculesEditorEnabled && toggleValue;
    setShowPolymerEditor(nextValue);
    window.isPolymerEditorTurnedOn = nextValue;
  };

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
  }, [macromoleculesEditor, isMacromoleculesEditorEnabled]);

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
  }, [showPolymerEditor]);

  useEffect(() => {
    window.isPolymerEditorTurnedOn = isMacromoleculesEditorTurnedOn;
  }, [isMacromoleculesEditorTurnedOn]);

  useEffect(() => {
    if (!moleculesEditor || !macromoleculesEditor) {
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
        // eslint-disable-next-line react-you-might-not-need-an-effect/no-chain-state-updates
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
      </div>
    </I18nextProvider>
  );
};
