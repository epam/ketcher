import { AttachmentPointName } from 'ketcher-core';
import Select from '../../../../../component/form/Select';
import { AttachmentPointSelectData } from '../../hooks/useAttachmentPointSelectsData';
import styles from './AttachmentPointControls.module.less';
import clsx from 'clsx';
import { ReactNode } from 'react';

type Props = {
  data: AttachmentPointSelectData;
  onNameChange: (newName: AttachmentPointName) => void;
  onLeavingAtomChange: (newLeavingAtomId: number) => void;
  className?: string;
  additionalControls?: ReactNode;
};

const AttachmentPointControls = ({
  data,
  onNameChange,
  onLeavingAtomChange,
  className,
  additionalControls,
}: Props) => {
  const {
    nameOptions,
    leavingAtomOptions,
    currentNameOption,
    currentLeavingAtomOption,
  } = data;

  const handleNameChange = (value: string) => {
    onNameChange(value as AttachmentPointName);
  };

  const handleLeavingAtomChange = (value: string) => {
    const atomId = parseInt(value, 10);
    onLeavingAtomChange(atomId);
  };

  return (
    <div className={clsx(styles.selectsWrapper, className)}>
      <Select
        className={styles.nameSelect}
        options={nameOptions}
        value={currentNameOption?.value}
        onChange={handleNameChange}
      />
      <Select
        className={styles.leavingAtomSelect}
        options={leavingAtomOptions}
        value={currentLeavingAtomOption?.value}
        onChange={handleLeavingAtomChange}
      />
      {additionalControls}
    </div>
  );
};

export default AttachmentPointControls;
