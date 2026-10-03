/* eslint-disable react-hooks/exhaustive-deps */
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
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
  // Subscribes this component to react-i18next's languageChanged event so
  // `dir` below is re-evaluated on a live language switch, not just on next
  // full page load. The hook's `t`/`i18n` return values aren't used here.
  useTranslation();
  const [showPolymerEditor, setShowPolymerEditor] = useState(false);
  const [moleculesEditor, setMoleculesEditor] = useState<MoleculesEditor>();
  const [macromoleculesEditor, setMacromoleculesEditor] =
    useState<CoreEditor>();

  // Refs (not state) so both init callbacks always see the latest instances,
  // regardless of which render they were created in.
  const ketcherRef = useRef<Ketcher | undefined>(undefined);
  const macromoleculesEditorRef = useRef<CoreEditor | undefined>(undefined);

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

  /*
   * This effect is synchronization with the DOM, not event handling.
   * The imperative editors must switch only after React has committed the
   * visibility change of their wrappers (display: none -> visible).
   * Moving this logic into togglePolymerEditor was attempted, but it renders
   * into a still-hidden container (zero-size SVG bounding boxes, focus fails),
   * which broke the e2e test that expands monomers in micromolecules mode.
   */
  /* eslint-disable react-you-might-not-need-an-effect/no-event-handler */
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
  /* eslint-enable react-you-might-not-need-an-effect/no-event-handler */

  // Called from both init callbacks. The editors initialize asynchronously in
  // no guaranteed order, so props.onInit fires on whichever call finds both
  // ready (or only the molecules editor, if macromolecules is disabled).
  const notifyInitIfReady = () => {
    const ketcher = ketcherRef.current;
    if (
      ketcher &&
      (macromoleculesEditorRef.current || props.disableMacromoleculesEditor) &&
      ketcherProvider.getIndexById(ketcher.id) !== -1
    ) {
      props.onInit?.(ketcher);
    }
  };

  const onInitMoleculesEditor = (ketcher: Ketcher) => {
    ketcherRef.current = ketcher;
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
      </div>
    </I18nextProvider>
  );
};
