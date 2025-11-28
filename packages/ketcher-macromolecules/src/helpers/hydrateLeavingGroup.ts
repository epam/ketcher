import { LeavingGroup } from 'ketcher-core';

const hydrateLeavingGroup = (leavingGroup: LeavingGroup) => {
  if (leavingGroup === 'O') {
    return 'OH';
  }
  if (leavingGroup === 'N') {
    return 'NH2';
  }
  return leavingGroup;
};

export default hydrateLeavingGroup;
