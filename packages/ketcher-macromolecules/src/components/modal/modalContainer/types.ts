import { BaseMonomer } from 'ketcher-core';
import { PolymerBond } from 'ketcher-core/dist/domain/entities/PolymerBond';

export interface MonomerConnectionOnlyProps {
  firstMonomer?: BaseMonomer;
  secondMonomer?: BaseMonomer;
  polymerBond?: PolymerBond;
  isReconnectionDialog?: boolean;
}

export interface RequiredModalProps {
  onClose: () => void;
  isModalOpen: boolean;
}
export type MonomerConnectionProps = MonomerConnectionOnlyProps &
  RequiredModalProps;

export type AdditionalModalProps = Partial<MonomerConnectionProps>;
