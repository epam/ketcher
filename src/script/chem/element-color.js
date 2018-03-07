/****************************************************************************
 * Copyright 2018 EPAM Systems
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

const colors = {
	// [ Standard (for sketching applications) atom colors, Old Ketcher colors ]
	H: ['#000000', '#000000'],
	He: ['#89a1a1', '#d9ffff'], // #849b9b
	Li: ['#bd77ed', '#cc80ff'], // #c87efa
	Be: ['#8fbc00', '#c2ff00'], // #82ab00
	B: ['#c18989', '#ffb5b5'], // #c38a8a
	C: ['#000000', '#000000'],
	N: ['#304ff7', '#304ff7'],
	O: ['#ff0d0d', '#ff0d0d'],
	F: ['#78bc42', '#8fe04f'], // #6dab3c
	Ne: ['#80a2af', '#b3e3f5'], // #7b9ca8
	Na: ['#ab5cf2', '#ab5cf2'],
	Mg: ['#6fcd00', '#8aff00'], // #61b400
	Al: ['#a99393', '#bfa6a6'], // #a79191
	Si: ['#b29478', '#f0c7a1'], // #b09276
	P: ['#ff8000', '#ff8000'],
	S: ['#c99a19', '#d9a61a'], // #c39517
	Cl: ['#1fd01f', '#1fd01f'], // #1dc51d
	Ar: ['#69acba', '#80d1e3'], // #63a2b0
	K: ['#8f40d4', '#8f40d4'],
	Ca: ['#38e900', '#3dff00'], // #2fc300
	Sc: ['#999999', '#e6e6e6'], // #969696
	Ti: ['#979a9e', '#bfc2c7'], // #94969a
	V: ['#99999e', '#a6a6ab'], // #96969a
	Cr: ['#8a99c7', '#8a99c7'], // #8796c3
	Mn: ['#9c7ac7', '#9c7ac7'],
	Fe: ['#e06633', '#e06633'],
	Co: ['#d37e8e', '#f08fa1'], // #db8293
	Ni: ['#4ece4e', '#4fd14f'], // #45b645
	Cu: ['#c78033', '#c78033'],
	Zn: ['#7d80b0', '#7d80b0'],
	Ga: ['#bc8b8b', '#c28f8f'], // #bd8c8c
	Ge: ['#668f8f', '#668f8f'],
	As: ['#b87ddd', '#bd80e3'], // #bd80e3
	Se: ['#e59100', '#ffa100'], // #e28f00
	Br: ['#a62929', '#a62929'],
	Kr: ['#59b1c9', '#5cb8d1'], // #53a6bc
	Rb: ['#702eb0', '#702eb0'],
	Sr: ['#00ff00', '#00ff00'], // #00d000
	Y: ['#66afaf', '#94ffff'], // #5fa4a4
	Zr: ['#71abab', '#94e0e0'], // #6ba2a2
	Nb: ['#67aeb4', '#73c2c9'], // #61a4a9
	Mo: ['#54b5b5', '#54b5b5'], // #4ea9a9
	Tc: ['#3b9e9e', '#3b9e9e'],
	Ru: ['#248f8f', '#248f8f'],
	Rh: ['#0a7d8c', '#0a7d8c'],
	Pd: ['#006985', '#006985'],
	Ag: ['#9a9a9a', '#bfbfbf'], // #969696
	Cd: ['#b29764', '#ffd98f'], // #ae9462
	In: ['#a67573', '#a67573'],
	Sn: ['#668080', '#668080'],
	Sb: ['#9e63b5', '#9e63b5'],
	Te: ['#d47a00', '#d47a00'],
	I: ['#940094', '#940094'],
	Xe: ['#429eb0', '#429eb0'],
	Cs: ['#57178f', '#57178f'],
	Ba: ['#00c900', '#00c900'],
	La: ['#5caed1', '#70d4ff'], // #57a4c5
	Ce: ['#9d9d7b', '#ffffc7'], // #989877
	Pr: ['#8ca581', '#d9ffc7'], // #869d7b
	Nd: ['#84a984', '#c7ffc7'], // #7da07d
	Pm: ['#71b18a', '#a3ffc7'], // #69a581
	Sm: ['#66b68e', '#8fffc7'], // #5ea883
	Eu: ['#4ac298', '#61ffc7'], // #43b089
	Gd: ['#37cb9e', '#45ffc7'], // #31b48d
	Tb: ['#28d1a4', '#30ffc7'], // #23b890
	Dy: ['#1bd7a8', '#1fffc7'], // #17bb92
	Ho: ['#00e98f', '#00ff9c'], // #00c578
	Er: ['#00e675', '#00e675'], // #00c765
	Tm: ['#00d452', '#00d452'], // #00c94e
	Yb: ['#00bf38', '#00bf38'],
	Lu: ['#00ab24', '#00ab24'],
	Hf: ['#47b3ec', '#4dc2ff'], // #42a8dc
	Ta: ['#4da6ff', '#4da6ff'], // #4ba2f9
	W: ['#2194d6', '#2194d6'],
	Re: ['#267dab', '#267dab'],
	Os: ['#266696', '#266696'],
	Ir: ['#175487', '#175487'],
	Pt: ['#9898a3', '#d1d1e0'], // #9595a0
	Au: ['#c19e1c', '#ffd124'], // #b9981a
	Hg: ['#9797ac', '#b8b8d1'], // #9595a9
	Tl: ['#a6544d', '#a6544d'],
	Pb: ['#575961', '#575961'],
	Bi: ['#9e4fb5', '#9e4fb5'],
	Po: ['#ab5c00', '#ab5c00'],
	At: ['#754f45', '#754f45'],
	Rn: ['#428296', '#428296'],
	Fr: ['#420066', '#420066'],
	Ra: ['#007d00', '#007d00'],
	Ac: ['#6aa2ec', '#70abfa'], // #669ce4
	Th: ['#00baff', '#00baff'], // #00b8fc
	Pa: ['#00a1ff', '#00a1ff'],
	U: ['#008fff', '#008fff'],
	Np: ['#0080ff', '#0080ff'],
	Pu: ['#006bff', '#006bff'],
	Am: ['#545cf2', '#545cf2'],
	Cm: ['#785ce3', '#785ce3'],
	Bk: ['#8a4fe3', '#8a4fe3'],
	Cf: ['#a136d4', '#a136d4'],
	Es: ['#b31fd4', '#b31fd4'],
	// Need to fix colors for the elements below (c)
	Fm: ['#000000', '#000000'],
	Md: ['#000000', '#000000'],
	No: ['#000000', '#000000'],
	Lr: ['#000000', '#000000'],
	Rf: ['#47b3ec', '#4dc2ff'],
	Db: ['#4da6ff', '#4da6ff'],
	Sg: ['#2194d6', '#2194d6'],
	Bh: ['#267dab', '#267dab'],
	Hs: ['#266696', '#266696'],
	Mt: ['#175487', '#175487'],
	Ds: ['#9898a3', '#d1d1e0'],
	Rg: ['#c19e1c', '#ffd124'],
	Cn: ['#9797ac', '#b8b8d1'],
	Nh: ['#000000', '#000000'],
	Fl: ['#000000', '#000000'],
	Mc: ['#000000', '#000000'],
	Lv: ['#000000', '#000000'],
	Ts: ['#000000', '#000000'],
	Og: ['#000000', '#000000']
};

export const sketchingColors = Object.keys(colors).reduce((res, item) => {
	res[item] = colors[item][0];
	return res;
}, {});

export const oldColors = Object.keys(colors).reduce((res, item) => {
	res[item] = colors[item][1];
	return res;
}, {});
