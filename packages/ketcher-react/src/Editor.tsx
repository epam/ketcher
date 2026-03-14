import { useState } from 'react';
import {
  MicromoleculesEditor as MicromoleculesEditorComponent,
  EditorProps,
} from './MicromoleculesEditor';
import styles from './Editor.module.less';
import { Ketcher } from 'ketcher-core';

type Props = Omit<EditorProps, 'ketcherId'>;

export const Editor = (props: Props) => {
  const [ketcherId, setKetcherId] = useState<string>('');

  const onInitMoleculesEditor = (ketcher: Ketcher) => {
    props.onInit?.(ketcher);
  };

  return (
    <div
      data-ketcher-editor
      className={styles.editorsWrapper}
    >
      <MicromoleculesEditorComponent
        {...props}
        ketcherId={ketcherId}
        onSetKetcherId={setKetcherId}
        onInit={onInitMoleculesEditor}
      />
    </div>
  );
};
