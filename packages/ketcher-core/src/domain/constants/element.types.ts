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
