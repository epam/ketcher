import { Monomer } from '@utils/types';

export const Presets = {
  A: { alias: 'A', testId: 'A_A_R_P' } as Monomer,
  C: { alias: 'C', testId: 'C_C_R_P' } as Monomer,
  G: { alias: 'G', testId: 'G_G_R_P' } as Monomer,
  T: { alias: 'T', testId: 'T_T_R_P' } as Monomer,
  U: { alias: 'U', testId: 'U_U_R_P' } as Monomer,
  dR_U_P: { alias: 'dR(U)P', testId: 'dR(U)P_U_dR_P' } as Monomer,
  MOE_A_P: { alias: 'MOE(A)P', testId: 'MOE(A)P_A_MOE_P' } as Monomer,
  MOE_5meC_P: {
    alias: 'MOE(5meC)P',
    testId: 'MOE(5meC)P_5meC_MOE_P',
  } as Monomer,
  MOE_G_P: { alias: 'MOE(G)P', testId: 'MOE(G)P_G_MOE_P' } as Monomer,
  MOE_T_P: { alias: 'MOE(T)P', testId: 'MOE(T)P_T_MOE_P' } as Monomer,
};

export type PresetsType = typeof Presets;
