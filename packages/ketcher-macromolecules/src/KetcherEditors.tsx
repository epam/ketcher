import 'ketcher-react/dist/index.css';

import { StrictMode, useState } from 'react';
import { ModeControl } from 'components/ModeControl';
import { Editor, EditorProps } from 'ketcher-react';
import { Editor as PolymerEditor } from './Editor';

type Props = EditorProps & {
  macromoleculesDisabled?: boolean;
};

export const KetcherEditors = (props: Props) => {
  const [showPolymerEditor, setShowPolymerEditor] = useState(false);

  const togglePolymerEditor = (toggleValue: boolean) => {
    setShowPolymerEditor(toggleValue);
    window.isPolymerEditorTurnedOn = toggleValue;
  };

  const togglerComponent = !props.macromoleculesDisabled ? (
    <ModeControl
      toggle={togglePolymerEditor}
      isPolymerEditor={showPolymerEditor}
    />
  ) : undefined;

  return showPolymerEditor ? (
    <>
      <PolymerEditor togglerComponent={togglerComponent} />
    </>
  ) : (
    <StrictMode>
      <Editor {...props} togglerComponent={togglerComponent} />
    </StrictMode>
  );
};
