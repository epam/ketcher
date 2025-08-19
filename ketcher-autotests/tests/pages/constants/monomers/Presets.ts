import { MonomerType, PresetType } from '@utils/types';
import { Sugar } from './Sugars';
import { Base } from './Bases';
import { Phosphate } from './Phosphates';

export const Preset = {
  A: {
    alias: 'A',
    testId: 'A_A_R_P',
    monomerType: MonomerType.Preset,
    sugar: Sugar.R,
    base: Base.A,
    phosphate: Phosphate.P,
  } as PresetType,
  C: {
    alias: 'C',
    testId: 'C_C_R_P',
    monomerType: MonomerType.Preset,
    sugar: Sugar.R,
    base: Base.C,
    phosphate: Phosphate.P,
  } as PresetType,
  G: {
    alias: 'G',
    testId: 'G_G_R_P',
    monomerType: MonomerType.Preset,
    sugar: Sugar.R,
    base: Base.G,
    phosphate: Phosphate.P,
  } as PresetType,
  T: {
    alias: 'T',
    testId: 'T_T_R_P',
    monomerType: MonomerType.Preset,
    sugar: Sugar.R,
    base: Base.T,
    phosphate: Phosphate.P,
  } as PresetType,
  U: {
    alias: 'U',
    testId: 'U_U_R_P',
    monomerType: MonomerType.Preset,
    sugar: Sugar.R,
    base: Base.U,
    phosphate: Phosphate.P,
  } as PresetType,
  dR_U_P: {
    alias: 'dR(U)P',
    testId: 'dR(U)P_U_dR_P',
    monomerType: MonomerType.Preset,
    sugar: Sugar.dR,
    base: Base.U,
    phosphate: Phosphate.P,
  } as PresetType,
  MOE_A_P: {
    alias: 'MOE(A)P',
    testId: 'MOE(A)P_A_MOE_P',
    monomerType: MonomerType.Preset,
    sugar: Sugar.MOE,
    base: Base.A,
    phosphate: Phosphate.P,
  } as PresetType,
  MOE_5meC_P: {
    alias: 'MOE(5meC)P',
    testId: 'MOE(5meC)P_5meC_MOE_P',
    monomerType: MonomerType.Preset,
    sugar: Sugar.MOE,
    base: Base._5meC,
    phosphate: Phosphate.P,
  } as PresetType,
  MOE_G_P: {
    alias: 'MOE(G)P',
    testId: 'MOE(G)P_G_MOE_P',
    monomerType: MonomerType.Preset,
    sugar: Sugar.MOE,
    base: Base.G,
    phosphate: Phosphate.P,
  } as PresetType,
  MOE_T_P: {
    alias: 'MOE(T)P',
    testId: 'MOE(T)P_T_MOE_P',
    monomerType: MonomerType.Preset,
    sugar: Sugar.MOE,
    base: Base.T,
    phosphate: Phosphate.P,
  } as PresetType,
};

export type PresetsType = typeof Preset;
