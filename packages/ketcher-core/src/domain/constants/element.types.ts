/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

export type ElementLabel =
  | 'H'
  | 'He'
  | 'Li'
  | 'Be'
  | 'B'
  | 'C'
  | 'N'
  | 'O'
  | 'F'
  | 'Ne'
  | 'Na'
  | 'Mg'
  | 'Al'
  | 'Si'
  | 'P'
  | 'S'
  | 'Cl'
  | 'Ar'
  | 'K'
  | 'Ca'
  | 'Sc'
  | 'Ti'
  | 'V'
  | 'Cr'
  | 'Mn'
  | 'Fe'
  | 'Co'
  | 'Ni'
  | 'Cu'
  | 'Zn'
  | 'Ga'
  | 'Ge'
  | 'As'
  | 'Se'
  | 'Br'
  | 'Kr'
  | 'Rb'
  | 'Sr'
  | 'Y'
  | 'Zr'
  | 'Nb'
  | 'Mo'
  | 'Tc'
  | 'Ru'
  | 'Rh'
  | 'Pd'
  | 'Ag'
  | 'Cd'
  | 'In'
  | 'Sn'
  | 'Sb'
  | 'Te'
  | 'I'
  | 'Xe'
  | 'Cs'
  | 'Ba'
  | 'La'
  | 'Ce'
  | 'Pr'
  | 'Nd'
  | 'Pm'
  | 'Sm'
  | 'Eu'
  | 'Gd'
  | 'Tb'
  | 'Dy'
  | 'Ho'
  | 'Er'
  | 'Tm'
  | 'Yb'
  | 'Lu'
  | 'Hf'
  | 'Ta'
  | 'W'
  | 'Re'
  | 'Os'
  | 'Ir'
  | 'Pt'
  | 'Au'
  | 'Hg'
  | 'Tl'
  | 'Pb'
  | 'Bi'
  | 'Po'
  | 'At'
  | 'Rn'
  | 'Fr'
  | 'Ra'
  | 'Ac'
  | 'Th'
  | 'Pa'
  | 'U'
  | 'Np'
  | 'Pu'
  | 'Am'
  | 'Cm'
  | 'Bk'
  | 'Cf'
  | 'Es'
  | 'Fm'
  | 'Md'
  | 'No'
  | 'Lr'
  | 'Rf'
  | 'Db'
  | 'Sg'
  | 'Bh'
  | 'Hs'
  | 'Mt'
  | 'Ds'
  | 'Rg'
  | 'Cn'
  | 'Nh'
  | 'Fl'
  | 'Mc'
  | 'Lv'
  | 'Ts'
  | 'Og';

export type Period = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type Group = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface Element {
  number: number;
  label: ElementLabel;
  period: Period;
  group: Group;
  title: string;
  state?: string;
  origin: string;
  type?: string;
  mass: number;
  leftH?: boolean;
}

export enum AtomLabel {
  Ac = 'Ac',
  Ag = 'Ag',
  Al = 'Al',
  Am = 'Am',
  Ar = 'Ar',
  As = 'As',
  At = 'At',
  Au = 'Au',
  B = 'B',
  Ba = 'Ba',
  Be = 'Be',
  Bh = 'Bh',
  Bi = 'Bi',
  Bk = 'Bk',
  Br = 'Br',
  C = 'C',
  Ca = 'Ca',
  Cd = 'Cd',
  Ce = 'Ce',
  Cf = 'Cf',
  Cl = 'Cl',
  Cm = 'Cm',
  Cn = 'Cn',
  Co = 'Co',
  Cr = 'Cr',
  Cs = 'Cs',
  Cu = 'Cu',
  Db = 'Db',
  Ds = 'Ds',
  Dy = 'Dy',
  Er = 'Er',
  Es = 'Es',
  Eu = 'Eu',
  F = 'F',
  Fe = 'Fe',
  Fl = 'Fl',
  Fm = 'Fm',
  Fr = 'Fr',
  Ga = 'Ga',
  Gd = 'Gd',
  Ge = 'Ge',
  H = 'H',
  He = 'He',
  Hf = 'Hf',
  Hg = 'Hg',
  Ho = 'Ho',
  Hs = 'Hs',
  I = 'I',
  In = 'In',
  Ir = 'Ir',
  K = 'K',
  Kr = 'Kr',
  La = 'La',
  Li = 'Li',
  Lr = 'Lr',
  Lu = 'Lu',
  Lv = 'Lv',
  Mc = 'Mc',
  Md = 'Md',
  Mg = 'Mg',
  Mn = 'Mn',
  Mo = 'Mo',
  Mt = 'Mt',
  N = 'N',
  Na = 'Na',
  Nb = 'Nb',
  Nd = 'Nd',
  Ne = 'Ne',
  Nh = 'Nh',
  Ni = 'Ni',
  No = 'No',
  Np = 'Np',
  O = 'O',
  Og = 'Og',
  Os = 'Os',
  P = 'P',
  Pa = 'Pa',
  Pb = 'Pb',
  Pd = 'Pd',
  Pm = 'Pm',
  Po = 'Po',
  Pr = 'Pr',
  Pt = 'Pt',
  Pu = 'Pu',
  Ra = 'Ra',
  Rb = 'Rb',
  Re = 'Re',
  Rf = 'Rf',
  Rg = 'Rg',
  Rh = 'Rh',
  Rn = 'Rn',
  Ru = 'Ru',
  S = 'S',
  Sb = 'Sb',
  Sc = 'Sc',
  Se = 'Se',
  Sg = 'Sg',
  Si = 'Si',
  Sm = 'Sm',
  Sn = 'Sn',
  Sr = 'Sr',
  Ta = 'Ta',
  Tb = 'Tb',
  Tc = 'Tc',
  Te = 'Te',
  Th = 'Th',
  Ti = 'Ti',
  Tl = 'Tl',
  Tm = 'Tm',
  Ts = 'Ts',
  U = 'U',
  V = 'V',
  W = 'W',
  Xe = 'Xe',
  Y = 'Y',
  Yb = 'Yb',
  Zn = 'Zn',
  Zr = 'Zr',
  // Query atoms
  D = 'D',
  T = 'T',
}
