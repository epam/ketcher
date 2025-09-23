import { AttachmentPointName } from 'ketcher-core';
import styles from './AttachmentPoint.module.less';

import { useAttachmentPointSelectsData } from '../../hooks/useAttachmentPointSelectsData';
import AttachmentPointControls from '../AttachmentPointControls/AttachmentPointControls';
import Editor from '../../../../../../editor';
import { Icon } from '../../../../../../../components';

type Props = {
  name: AttachmentPointName;
  editor: Editor;
  onNameChange: (
    currentName: AttachmentPointName,
    newName: AttachmentPointName,
  ) => void;
  onLeavingAtomChange: (
    apName: AttachmentPointName,
    newLeavingAtomId: number,
  ) => void;
  onRemove: (name: AttachmentPointName) => void;
};

const AttachmentPoint = ({
  name,
  editor,
  onNameChange,
  onLeavingAtomChange,
  onRemove,
}: Props) => {
  const selectData = useAttachmentPointSelectsData(editor, name);

  const handleNameChange = (newName: AttachmentPointName) => {
    if (newName !== name) {
      onNameChange(name, newName);
    }
  };

  const handleLeavingAtomChange = (newLeavingAtomId: number) => {
    onLeavingAtomChange(name, newLeavingAtomId);
  };

  const handleRemove = () => {
    onRemove(name);
  };

  return (
    <AttachmentPointControls
      data={selectData}
      onNameChange={handleNameChange}
      onLeavingAtomChange={handleLeavingAtomChange}
      className={styles.selects}
      additionalControls={
        <button
          className={styles.removeButton}
          onClick={handleRemove}
          aria-label="Remove attachment point"
        >
          <Icon name="deleteMenu" />
        </button>
      }
    />
  );
};

export default AttachmentPoint;
