import { BaseMonomer } from 'ketcher-core';

export interface MonomerConnectionOnlyProps {
  firstMonomer?: BaseMonomer;
  secondMonomer?: BaseMonomer;
}

export interface RequiredModalProps {
  onClose: () => void;
  isModalOpen: boolean;
}
export type MonomerConnectionProps = MonomerConnectionOnlyProps &
  RequiredModalProps;

export type AdditionalModalProps = Partial<MonomerConnectionProps>;
