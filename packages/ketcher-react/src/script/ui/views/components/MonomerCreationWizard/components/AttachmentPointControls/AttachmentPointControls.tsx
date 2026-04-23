import { AtomLabel, AttachmentPointName } from 'ketcher-core';
import Select from '../../../../../component/form/Select';
import { AttachmentPointSelectData } from '../../hooks/useAttachmentPointSelectsData';
import styles from './AttachmentPointControls.module.less';
import clsx from 'clsx';
import { forwardRef, ReactNode } from 'react';

type Props = {
  data: AttachmentPointSelectData;
  onNameChange: (newName: AttachmentPointName) => void;
  onLeavingAtomChange: (newLeavingAtomLabel: AtomLabel) => void;
  className?: string;
  additionalControls?: ReactNode;
  highlight?: boolean;
  isPopup?: boolean;
  disabled?: boolean;
  /** Disable only the name select, leaving the leaving-atom select editable */
  disabledName?: boolean;
  /** Tooltip shown on the name select when it is disabled */
  nameTooltip?: string;
};

const AttachmentPointControls = forwardRef<HTMLDivElement, Props>(
  (
    {
      data,
      onNameChange,
      onLeavingAtomChange,
      className,
      additionalControls,
      highlight,
      isPopup,
      disabled,
      disabledName,
      nameTooltip,
    },
    ref,
  ) => {
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
      onLeavingAtomChange(value as AtomLabel);
    };

    return (
      <div
        className={clsx(
          styles.selectsWrapper,
          className,
          highlight && styles.highlight,
        )}
        ref={ref}
        data-testid={`attachment-point-controls-${currentNameOption?.label}`}
      >
        <span title={disabledName ? nameTooltip : undefined}>
          <Select
            className={styles.nameSelect}
            options={nameOptions}
            value={currentNameOption?.value}
            onChange={handleNameChange}
            disabled={disabled || disabledName}
            data-testid={
              isPopup
                ? `attachment-point-name-select`
                : `attachment-point-name-select-${currentNameOption?.label}`
            }
          />
        </span>
        <Select
          className={styles.leavingAtomSelect}
          options={leavingAtomOptions}
          value={currentLeavingAtomOption?.value}
          onChange={handleLeavingAtomChange}
          disabled={disabled}
          data-testid={
            isPopup
              ? `attachment-point-atom-select`
              : `attachment-point-atom-select-${currentNameOption?.label}`
          }
        />
        {additionalControls}
      </div>
    );
  },
);

export default AttachmentPointControls;
