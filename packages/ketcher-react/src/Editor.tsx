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
  ketcherProvider,
  type MonomerCreationWizardRequest,
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

// @ts-ignore ketcher-macromolecules is not available during ketcher-react build (dynamic import)
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
  const [isMonomerWizardOpen, setIsMonomerWizardOpen] = useState(false);
  const pendingWizard = useRef<MonomerCreationWizardRequest | undefined>(
    undefined,
  );
  const wizardSessionActive = useRef(false);
  const skipModeConversion = useRef(false);
  const togglePolymerEditor = (toggleValue: boolean) => {
    setShowPolymerEditor(toggleValue);
    window.isPolymerEditorTurnedOn = toggleValue;
  };

  const togglerComponent = !props.disableMacromoleculesEditor ? (
    <ModeControl
      toggle={(value) => {
        if (!isMonomerWizardOpen) togglePolymerEditor(value);
      }}
      isPolymerEditor={showPolymerEditor}
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

    if (macromoleculesEditor) {
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
  }, [macromoleculesEditor]);

  useEffect(() => {
    return () => {
      window.isPolymerEditorTurnedOn = false;
    };
  }, []);

  useEffect(() => {
    if (moleculesEditor && macromoleculesEditor) {
      if (skipModeConversion.current) {
        skipModeConversion.current = false;
        return;
      }
      const request = pendingWizard.current;
      if (request) {
        pendingWizard.current = undefined;
        const finishSession = (savedCanvas: boolean) => {
          try {
            macromoleculesEditor.finishMonomerWizardSession(savedCanvas);
          } finally {
            wizardSessionActive.current = false;
            skipModeConversion.current = true;
            setIsMonomerWizardOpen(false);
            togglePolymerEditor(true);
          }
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
      if (ketcherProvider.getIndexById(ketcher.id) !== -1) {
        props.onInit?.(ketcher);
      }
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
