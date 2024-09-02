import { LeavingGroup } from 'ketcher-core';

const hydrateLeavingGroup = (leavingGroup: LeavingGroup) => {
  return leavingGroup === 'O' ? 'OH' : leavingGroup;
};

export default hydrateLeavingGroup;
