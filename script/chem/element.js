/****************************************************************************
 * Copyright (C) 2017 EPAM Systems
 *
 * This file is part of the Ketcher
 * The contents are covered by the terms of the BSD 3-Clause license
 * which is included in the file LICENSE.md, found at the root
 * of the Ketcher source tree.
 ***************************************************************************/

var element = [
	null,
	{
		label: 'H',             // 1
		period: 1,
		group: 1,
		color: '#000000',
		title: "Hydrogen",
		state: 'gas',
		origin: 'primordial',
		type: 'diatomic',
		atomic_mass: 1.00794
	},
	{
		label: 'He',            // 2
		period: 1,
		group: 8,
		color: '#d9ffff',
		title: "Helium",
		state: 'gas',
		origin: 'primordial',
		type: 'noble',
		atomic_mass: 4.0026022
	},
	{
		label: 'Li',            // 3
		period: 2,
		group: 1,
		color: '#cc80ff',
		title: "Lithium",
		state: 'solid',
		origin: 'primordial',
		type: 'alkali',
		atomic_mass: 6.94
	},
	{
		label: 'Be',            // 4
		period: 2,
		group: 2,
		color: '#c2ff00',
		title: "Beryllium",
		state: 'solid',
		origin: 'primordial',
		type: 'alkaline-earth',
		atomic_mass: 9.01218315
	},
	{
		label: 'B',             // 5
		period: 2,
		group: 3,
		color: '#ffb5b5',
		title: "Boron",
		state: 'solid',
		origin: 'primordial',
		type: 'metalloid',
		atomic_mass: 10.81
	},
	{
		label: 'C',             // 6
		period: 2,
		group: 4,
		title: "Carbon",
		state: 'solid',
		origin: 'primordial',
		type: 'polyatomic',
		atomic_mass: 12.011
	},
	{
		label: 'N',             // 7
		period: 2,
		group: 5,
		color: '#304ff7',
		title: "Nitrogen",
		state: 'gas',
		origin: 'primordial',
		type: 'diatomic',
		atomic_mass: 14.007
	},
	{
		label: 'O',             // 8
		period: 2,
		group: 6,
		leftH: true,
		color: '#ff0d0d',
		title: "Oxygen",
		state: 'gas',
		origin: 'primordial',
		type: 'diatomic',
		atomic_mass: 15.999
	},
	{
		label: 'F',             // 9
		period: 2,
		group: 7,
		leftH: true,
		color: '#8fe04f',
		title: "Fluorine",
		state: 'gas',
		origin: 'primordial',
		type: 'diatomic',
		atomic_mass: 18.9984031636
	},
	{
		label: 'Ne',            // 10
		period: 2,
		group: 8,
		color: '#b3e3f5',
		title: "Neon",
		state: 'gas',
		origin: 'primordial',
		type: 'noble',
		atomic_mass: 20.17976
	},
	{
		label: 'Na',            // 11
		period: 3,
		group: 1,
		color: '#ab5cf2',
		title: "Sodium",
		state: 'solid',
		origin: 'primordial',
		type: 'alkali',
		atomic_mass: 22.989769282
	},
	{
		label: 'Mg',            // 12
		period: 3,
		group: 2,
		color: '#8aff00',
		title: "Magnesium",
		state: 'solid',
		origin: 'primordial',
		type: 'alkaline-earth',
		atomic_mass: 24.305
	},
	{
		label: 'Al',            // 13
		period: 3,
		group: 3,
		color: '#bfa6a6',
		title: "Aluminium",
		state: 'solid',
		origin: 'primordial',
		type: 'post-transition',
		atomic_mass: 26.98153857
	},
	{
		label: 'Si',            // 14
		period: 3,
		group: 4,
		color: '#f0c7a1',
		title: "Silicon",
		state: 'solid',
		origin: 'primordial',
		type: 'metalloid',
		atomic_mass: 28.085
	},
	{
		label: 'P',             // 15
		period: 3,
		group: 5,
		color: '#ff8000',
		title: "Phosphorus",
		state: 'solid',
		origin: 'primordial',
		type: 'polyatomic',
		atomic_mass: 30.9737619985
	},
	{
		label: 'S',             // 16
		period: 3,
		group: 6,
		leftH: true,
		color: '#d9a61a',
		title: "Sulfur",
		state: 'solid',
		origin: 'primordial',
		type: 'polyatomic',
		atomic_mass: 32.06
	},
	{
		label: 'Cl',            // 17
		period: 3,
		group: 7,
		leftH: true,
		color: '#1fd01f',
		title: "Chlorine",
		state: 'gas',
		origin: 'primordial',
		type: 'diatomic',
		atomic_mass: 35.45
	},
	{
		label: 'Ar',            // 18
		period: 3,
		group: 8,
		color: '#80d1e3',
		title: "Argon",
		state: 'gas',
		origin: 'primordial',
		type: 'noble',
		atomic_mass: 39.9481
	},
	{
		label: 'K',             // 19
		period: 4,
		group: 1,
		color: '#8f40d4',
		title: "Potassium",
		state: 'solid',
		origin: 'primordial',
		type: 'alkali',
		atomic_mass: 39.09831
	},
	{
		label: 'Ca',            // 20
		period: 4,
		group: 2,
		color: '#3dff00',
		title: "Calcium",
		state: 'solid',
		origin: 'primordial',
		type: 'alkaline-earth',
		atomic_mass: 40.0784
	},
	{
		label: 'Sc',            // 21
		period: 4,
		group: 3,
		color: '#e6e6e6',
		title: "Scandium",
		state: 'solid',
		origin: 'primordial',
		type: 'transition',
		atomic_mass: 44.9559085
	},
	{
		label: 'Ti',            // 22
		period: 4,
		group: 4,
		color: '#bfc2c7',
		title: "Titanium",
		state: 'solid',
		origin: 'primordial',
		type: 'transition',
		atomic_mass: 47.8671
	},
	{
		label: 'V',             // 23
		period: 4,
		group: 5,
		color: '#a6a6ab',
		title: "Vanadium",
		state: 'solid',
		origin: 'primordial',
		type: 'transition',
		atomic_mass: 50.94151
	},
	{
		label: 'Cr',            // 24
		period: 4,
		group: 6,
		color: '#8a99c7',
		title: "Chromium",
		state: 'solid',
		origin: 'primordial',
		type: 'transition',
		atomic_mass: 51.99616
	},
	{
		label: 'Mn',            // 25
		period: 4,
		group: 7,
		color: '#9c7ac7',
		title: "Manganese",
		state: 'solid',
		origin: 'primordial',
		type: 'transition',
		atomic_mass: 54.9380443
	},
	{
		label: 'Fe',            // 26
		period: 4,
		group: 8,
		color: '#e06633',
		title: "Iron",
		state: 'solid',
		origin: 'primordial',
		type: 'transition',
		atomic_mass: 55.8452
	},
	{
		label: 'Co',            // 27
		period: 4,
		group: 8,
		color: '#f08fa1',
		title: "Cobalt",
		state: 'solid',
		origin: 'primordial',
		type: 'transition',
		atomic_mass: 58.9331944
	},
	{
		label: 'Ni',            // 28
		period: 4,
		group: 8,
		color: '#4fd14f',
		title: "Nickel",
		state: 'solid',
		origin: 'primordial',
		type: 'transition',
		atomic_mass: 58.69344
	},
	{
		label: 'Cu',            // 29
		period: 4,
		group: 1,
		color: '#c78033',
		title: "Copper",
		state: 'solid',
		origin: 'primordial',
		type: 'transition',
		atomic_mass: 63.5463
	},
	{
		label: 'Zn',            // 30
		period: 4,
		group: 2,
		color: '#7d80b0',
		title: "Zinc",
		state: 'solid',
		origin: 'primordial',
		type: 'transition',
		atomic_mass: 65.382
	},
	{
		label: 'Ga',            // 31
		period: 4,
		group: 3,
		color: '#c28f8f',
		title: "Gallium",
		state: 'solid',
		origin: 'primordial',
		type: 'post-transition',
		atomic_mass: 69.7231
	},
	{
		label: 'Ge',            // 32
		period: 4,
		group: 4,
		color: '#668f8f',
		title: "Germanium",
		state: 'solid',
		origin: 'primordial',
		type: 'metalloid',
		atomic_mass: 72.6308
	},
	{
		label: 'As',            // 33
		period: 4,
		group: 5,
		color: '#bd80e3',
		title: "Arsenic",
		state: 'solid',
		origin: 'primordial',
		type: 'metalloid',
		atomic_mass: 74.9215956
	},
	{
		label: 'Se',            // 34
		period: 4,
		group: 6,
		leftH: true,
		color: '#ffa100',
		title: "Selenium",
		state: 'solid',
		origin: 'primordial',
		type: 'polyatomic',
		atomic_mass: 78.9718
	},
	{
		label: 'Br',            // 35
		period: 4,
		group: 7,
		leftH: true,
		color: '#a62929',
		title: "Bromine",
		state: 'liquid',
		origin: 'primordial',
		type: 'diatomic',
		atomic_mass: 79.904
	},
	{
		label: 'Kr',            // 36
		period: 4,
		group: 8,
		color: '#5cb8d1',
		title: "Krypton",
		state: 'gas',
		origin: 'primordial',
		type: 'noble',
		atomic_mass: 83.7982
	},
	{
		label: 'Rb',            // 37
		period: 5,
		group: 1,
		color: '#702eb0',
		title: "Rubidium",
		state: 'solid',
		origin: 'primordial',
		type: 'alkali',
		atomic_mass: 85.46783
	},
	{
		label: 'Sr',            // 38
		period: 5,
		group: 2,
		color: '#00ff00',
		title: "Strontium",
		state: 'solid',
		origin: 'primordial',
		type: 'alkaline-earth',
		atomic_mass: 87.621
	},
	{
		label: 'Y',             // 39
		period: 5,
		group: 3,
		color: '#94ffff',
		title: "Yttrium",
		state: 'solid',
		origin: 'primordial',
		type: 'transition',
		atomic_mass: 88.905842
	},
	{
		label: 'Zr',            // 40
		period: 5,
		group: 4,
		color: '#94e0e0',
		title: "Zirconium",
		state: 'solid',
		origin: 'primordial',
		type: 'transition',
		atomic_mass: 91.2242
	},
	{
		label: 'Nb',            // 41
		period: 5,
		group: 5,
		color: '#73c2c9',
		title: "Niobium",
		state: 'solid',
		origin: 'primordial',
		type: 'transition',
		atomic_mass: 92.906372
	},
	{
		label: 'Mo',            // 42
		period: 5,
		group: 6,
		color: '#54b5b5',
		title: "Molybdenum",
		state: 'solid',
		origin: 'primordial',
		type: 'transition',
		atomic_mass: 95.951
	},
	{
		label: 'Tc',            // 43
		period: 5,
		group: 7,
		color: '#3b9e9e',
		title: "Technetium",
		state: 'solid',
		origin: 'decay',
		type: 'transition',
		atomic_mass: 98
	},
	{
		label: 'Ru',            // 44
		period: 5,
		group: 8,
		color: '#248f8f',
		title: "Ruthenium",
		state: 'solid',
		origin: 'primordial',
		type: 'transition',
		atomic_mass: 101.072
	},
	{
		label: 'Rh',            // 45
		period: 5,
		group: 8,
		color: '#0a7d8c',
		title: "Rhodium",
		state: 'solid',
		origin: 'primordial',
		type: 'transition',
		atomic_mass: 102.905502
	},
	{
		label: 'Pd',            // 46
		period: 5,
		group: 8,
		color: '#006985',
		title: "Palladium",
		state: 'solid',
		origin: 'primordial',
		type: 'transition',
		atomic_mass: 106.421
	},
	{
		label: 'Ag',            // 47
		period: 5,
		group: 1,
		color: '#bfbfbf',
		title: "Silver",
		state: 'solid',
		origin: 'primordial',
		type: 'transition',
		atomic_mass: 107.86822
	},
	{
		label: 'Cd',            // 48
		period: 5,
		group: 2,
		color: '#ffd98f',
		title: "Cadmium",
		state: 'solid',
		origin: 'primordial',
		type: 'transition',
		atomic_mass: 112.4144
	},
	{
		label: 'In',            // 49
		period: 5,
		group: 3,
		color: '#a67573',
		title: "Indium",
		state: 'solid',
		origin: 'primordial',
		type: 'post-transition',
		atomic_mass: 114.8181
	},
	{
		label: 'Sn',            // 50
		period: 5,
		group: 4,
		color: '#668080',
		title: "Tin",
		state: 'solid',
		origin: 'primordial',
		type: 'post-transition',
		atomic_mass: 118.7107
	},
	{
		label: 'Sb',            // 51
		period: 5,
		group: 5,
		color: '#9e63b5',
		title: "Antimony",
		state: 'solid',
		origin: 'primordial',
		type: 'metalloid',
		atomic_mass: 121.7601
	},
	{
		label: 'Te',            // 52
		period: 5,
		group: 6,
		color: '#d47a00',
		title: "Tellurium",
		state: 'solid',
		origin: 'primordial',
		type: 'metalloid',
		atomic_mass: 127.603
	},
	{
		label: 'I',           // 53
		period: 5,
		group: 7,
		leftH: true,
		color: '#940094',
		title: "Iodine",
		state: 'solid',
		origin: 'primordial',
		type: 'diatomic',
		atomic_mass: 126.904473
	},
	{
		label: 'Xe',            // 54
		period: 5,
		group: 8,
		color: '#429eb0',
		title: "Xenon",
		state: 'gas',
		origin: 'primordial',
		type: 'noble',
		atomic_mass: 131.2936
	},
	{
		label: 'Cs',            // 55
		period: 6,
		group: 1,
		color: '#57178f',
		title: "Caesium",
		state: 'solid',
		origin: 'primordial',
		type: 'alkali',
		atomic_mass: 132.905451966
	},
	{
		label: 'Ba',            // 56
		period: 6,
		group: 2,
		color: '#00c900',
		title: "Barium",
		state: 'solid',
		origin: 'primordial',
		type: 'alkaline-earth',
		atomic_mass: 137.3277
	},
	{
		label: 'La',            // 57
		period: 6,
		group: 3,
		color: '#70d4ff',
		title: "Lanthanum",
		state: 'solid',
		origin: 'primordial',
		type: 'lanthanide',
		atomic_mass: 138.905477
	},
	{
		label: 'Ce',            // 58
		period: 6,
		group: 3,
		color: '#ffffc7',
		title: "Cerium",
		state: 'solid',
		origin: 'primordial',
		type: 'lanthanide',
		atomic_mass: 140.1161
	},
	{
		label: 'Pr',            // 59
		period: 6,
		group: 3,
		color: '#d9ffc7',
		title: "Praseodymium",
		state: 'solid',
		origin: 'primordial',
		type: 'lanthanide',
		atomic_mass: 140.907662
	},
	{
		label: 'Nd',            // 60
		period: 6,
		group: 3,
		color: '#c7ffc7',
		title: "Neodymium",
		state: 'solid',
		origin: 'primordial',
		type: 'lanthanide',
		atomic_mass: 144.2423
	},
	{
		label: 'Pm',            // 61
		period: 6,
		group: 3,
		color: '#a3ffc7',
		title: "Promethium",
		state: 'solid',
		origin: 'decay',
		type: 'lanthanide',
		atomic_mass: 145
	},
	{
		label: 'Sm',            // 62
		period: 6,
		group: 3,
		color: '#8fffc7',
		title: "Samarium",
		state: 'solid',
		origin: 'primordial',
		type: 'lanthanide',
		atomic_mass: 150.362
	},
	{
		label: 'Eu',            // 63
		period: 6,
		group: 3,
		color: '#61ffc7',
		title: "Europium",
		state: 'solid',
		origin: 'primordial',
		type: 'lanthanide',
		atomic_mass: 151.9641
	},
	{
		label: 'Gd',            // 64
		period: 6,
		group: 3,
		color: '#45ffc7',
		title: "Gadolinium",
		state: 'solid',
		origin: 'primordial',
		type: 'lanthanide',
		atomic_mass: 157.253
	},
	{
		label: 'Tb',            // 65
		period: 6,
		group: 3,
		color: '#30ffc7',
		title: "Terbium",
		state: 'solid',
		origin: 'primordial',
		type: 'lanthanide',
		atomic_mass: 158.925352
	},
	{
		label: 'Dy',            // 66
		period: 6,
		group: 3,
		color: '#1fffc7',
		title: "Dysprosium",
		state: 'solid',
		origin: 'primordial',
		type: 'lanthanide',
		atomic_mass: 162.5001
	},
	{
		label: 'Ho',            // 67
		period: 6,
		group: 3,
		color: '#00ff9c',
		title: "Holmium",
		state: 'solid',
		origin: 'primordial',
		type: 'lanthanide',
		atomic_mass: 164.930332
	},
	{
		label: 'Er',            // 68
		period: 6,
		group: 3,
		color: '#00e675',
		title: "Erbium",
		state: 'solid',
		origin: 'primordial',
		type: 'lanthanide',
		atomic_mass: 167.2593
	},
	{
		label: 'Tm',            // 69
		period: 6,
		group: 3,
		color: '#00d452',
		title: "Thulium",
		state: 'solid',
		origin: 'primordial',
		type: 'lanthanide',
		atomic_mass: 168.934222
	},
	{
		label: 'Yb',            // 70
		period: 6,
		group: 3,
		color: '#00bf38',
		title: "Ytterbium",
		state: 'solid',
		origin: 'primordial',
		type: 'lanthanide',
		atomic_mass: 173.0451
	},
	{
		label: 'Lu',            // 71
		period: 6,
		group: 3,
		color: '#00ab24',
		title: "Lutetium",
		state: 'solid',
		origin: 'primordial',
		type: 'lanthanide',
		atomic_mass: 174.96681
	},
	{
		label: 'Hf',            // 72
		period: 6,
		group: 4,
		color: '#4dc2ff',
		title: "Hafnium",
		state: 'solid',
		origin: 'primordial',
		type: 'transition',
		atomic_mass: 178.492
	},
	{
		label: 'Ta',            // 73
		period: 6,
		group: 5,
		color: '#4da6ff',
		title: "Tantalum",
		state: 'solid',
		origin: 'primordial',
		type: 'transition',
		atomic_mass: 180.947882
	},
	{
		label: 'W',             // 74
		period: 6,
		group: 6,
		color: '#2194d6',
		title: "Tungsten",
		state: 'solid',
		origin: 'primordial',
		type: 'transition',
		atomic_mass: 183.841
	},
	{
		label: 'Re',            // 75
		period: 6,
		group: 7,
		color: '#267dab',
		title: "Rhenium",
		state: 'solid',
		origin: 'primordial',
		type: 'transition',
		atomic_mass: 186.2071
	},
	{
		label: 'Os',            // 76
		period: 6,
		group: 8,
		color: '#266696',
		title: "Osmium",
		state: 'solid',
		origin: 'primordial',
		type: 'transition',
		atomic_mass: 190.233
	},
	{
		label: 'Ir',            // 77
		period: 6,
		group: 8,
		color: '#175487',
		title: "Iridium",
		state: 'solid',
		origin: 'primordial',
		type: 'transition',
		atomic_mass: 192.2173
	},
	{
		label: 'Pt',            // 78
		period: 6,
		group: 8,
		color: '#d1d1e0',
		title: "Platinum",
		state: 'solid',
		origin: 'primordial',
		type: 'transition',
		atomic_mass: 195.0849
	},
	{
		label: 'Au',            // 79
		period: 6,
		group: 1,
		color: '#ffd124',
		title: "Gold",
		state: 'solid',
		origin: 'primordial',
		type: 'transition',
		atomic_mass: 196.9665695
	},
	{
		label: 'Hg',            // 80
		period: 6,
		group: 2,
		color: '#b8b8d1',
		title: "Mercury",
		state: 'liquid',
		origin: 'primordial',
		type: 'transition',
		atomic_mass: 200.5923
	},
	{
		label: 'Tl',            // 81
		period: 6,
		group: 3,
		color: '#a6544d',
		title: "Thallium",
		state: 'solid',
		origin: 'primordial',
		type: 'post-transition',
		atomic_mass: 204.38
	},
	{
		label: 'Pb',            // 82
		period: 6,
		group: 4,
		color: '#575961',
		title: "Lead",
		state: 'solid',
		origin: 'primordial',
		type: 'post-transition',
		atomic_mass: 207.21
	},
	{
		label: 'Bi',            // 83
		period: 6,
		group: 5,
		color: '#9e4fb5',
		title: "Bismuth",
		state: 'solid',
		origin: 'primordial',
		type: 'post-transition',
		atomic_mass: 208.980401
	},
	{
		label: 'Po',            // 84
		period: 6,
		group: 6,
		color: '#ab5c00',
		title: "Polonium",
		state: 'solid',
		origin: 'decay',
		type: 'post-transition',
		atomic_mass: 209
	},
	{
		label: 'At',            // 85
		period: 6,
		group: 7,
		color: '#754f45',
		title: "Astatine",
		state: 'solid',
		origin: 'decay',
		type: 'metalloid',
		atomic_mass: 210
	},
	{
		label: 'Rn',            // 86
		period: 6,
		group: 8,
		color: '#428296',
		title: "Radon",
		state: 'gas',
		origin: 'decay',
		type: 'noble',
		atomic_mass: 222
	},
	{
		label: 'Fr',            // 87
		period: 7,
		group: 1,
		color: '#420066',
		title: "Francium",
		state: 'solid',
		origin: 'decay',
		type: 'alkali',
		atomic_mass: 223
	},
	{
		label: 'Ra',            // 88
		period: 7,
		group: 2,
		color: '#007d00',
		title: "Radium",
		state: 'solid',
		origin: 'decay',
		type: 'alkaline-earth',
		atomic_mass: 226
	},
	{
		label: 'Ac',            // 89
		period: 7,
		group: 3,
		color: '#70abfa',
		title: "Actinium",
		state: 'solid',
		origin: 'decay',
		type: 'actinide',
		atomic_mass: 227
	},
	{
		label: 'Th',            // 90
		period: 7,
		group: 3,
		color: '#00baff',
		title: "Thorium",
		state: 'solid',
		origin: 'primordial',
		type: 'actinide',
		atomic_mass: 232.03774
	},
	{
		label: 'Pa',            // 91
		period: 7,
		group: 3,
		color: '#00a1ff',
		title: "Protactinium",
		state: 'solid',
		origin: 'decay',
		type: 'actinide',
		atomic_mass: 231.035882
	},
	{
		label: 'U',             // 92
		period: 7,
		group: 3,
		color: '#008fff',
		title: "Uranium",
		state: 'solid',
		origin: 'primordial',
		type: 'actinide',
		atomic_mass: 238.028913
	},
	{
		label: 'Np',            // 93
		period: 7,
		group: 3,
		color: '#0080ff',
		title: "Neptunium",
		state: 'solid',
		origin: 'decay',
		type: 'actinide',
		atomic_mass: 237
	},
	{
		label: 'Pu',            // 94
		period: 7,
		group: 3,
		color: '#006bff',
		title: "Plutonium",
		state: 'solid',
		origin: 'decay',
		type: 'actinide',
		atomic_mass: 244
	},
	{
		label: 'Am',            // 95
		period: 7,
		group: 3,
		color: '#545cf2',
		title: "Americium",
		state: 'solid',
		origin: 'synthetic',
		type: 'actinide',
		atomic_mass: 243
	},
	{
		label: 'Cm',            // 96
		period: 7,
		group: 3,
		color: '#785ce3',
		title: "Curium",
		state: 'solid',
		origin: 'synthetic',
		type: 'actinide',
		atomic_mass: 247
	},
	{
		label: 'Bk',            // 97
		period: 7,
		group: 3,
		color: '#8a4fe3',
		title: "Berkelium",
		state: 'solid',
		origin: 'synthetic',
		type: 'actinide',
		atomic_mass: 247
	},
	{
		label: 'Cf',            // 98
		period: 7,
		group: 3,
		color: '#a136d4',
		title: "Californium",
		state: 'solid',
		origin: 'synthetic',
		type: 'actinide',
		atomic_mass: 251
	},
	{
		label: 'Es',            // 99
		period: 7,
		group: 3,
		color: '#b31fd4',
		title: "Einsteinium",
		state: 'solid',
		origin: 'synthetic',
		type: 'actinide',
		atomic_mass: 252
	},
	// TODO: fix colors for the elements below
	{
		label: 'Fm',            // 100
		period: 7,
		group: 3,
		title: "Fermium",
		origin: 'synthetic',
		type: 'actinide',
		atomic_mass: 257
	},
	{
		label: 'Md',            // 101
		period: 7,
		group: 3,
		title: "Mendelevium",
		origin: 'synthetic',
		type: 'actinide',
		atomic_mass: 258
	},
	{
		label: 'No',            // 102
		period: 7,
		group: 3,
		title: "Nobelium",
		origin: 'synthetic',
		type: 'actinide',
		atomic_mass: 259
	},
	{
		label: 'Lr',            // 103
		period: 7,
		group: 3,
		title: "Lawrencium",
		origin: 'synthetic',
		type: 'actinide',
		atomic_mass: 266
	},
	{
		label: 'Rf',            // 104
		period: 7,
		group: 4,
		color: '#4dc2ff',
		title: "Rutherfordium",
		origin: 'synthetic',
		type: 'transition',
		atomic_mass: 267
	},
	{
		label: 'Db',            // 105
		period: 7,
		group: 5,
		color: '#4da6ff',
		title: "Dubnium",
		origin: 'synthetic',
		type: 'transition',
		atomic_mass: 268
	},
	{
		label: 'Sg',            // 106
		period: 7,
		group: 6,
		color: '#2194d6',
		title: "Seaborgium",
		origin: 'synthetic',
		type: 'transition',
		atomic_mass: 269
	},
	{
		label: 'Bh',            // 107
		period: 7,
		group: 7,
		color: '#267dab',
		title: "Bohrium",
		origin: 'synthetic',
		type: 'transition',
		atomic_mass: 270
	},
	{
		label: 'Hs',            // 108
		period: 7,
		group: 8,
		color: '#266696',
		title: "Hassium",
		origin: 'synthetic',
		type: 'transition',
		atomic_mass: 269
	},
	{
		label: 'Mt',            // 109
		period: 7,
		group: 8,
		color: '#175487',
		title: "Meitnerium",
		origin: 'synthetic',
		atomic_mass: 278
	},
	{
		label: 'Ds',            // 110
		period: 7,
		group: 8,
		color: '#d1d1e0',
		title: "Darmstadtium",
		origin: 'synthetic',
		atomic_mass: 281
	},
	{
		label: 'Rg',            // 111
		period: 7,
		group: 1,
		color: '#ffd124',
		title: "Roentgenium",
		origin: 'synthetic',
		atomic_mass: 282
	},
	{
		label: 'Cn',            // 112
		period: 7,
		group: 2,
		color: '#b8b8d1',
		title: "Copernicium",
		origin: 'synthetic',
		type: 'transition',
		atomic_mass: 285
	},
	{
		label: 'Nh',            // 113
		period: 7,
		group: 3,
		title: "Nihonium",
		origin: 'synthetic',
		atomic_mass: 286
	},
	{
		label: 'Fl',            // 114
		period: 7,
		group: 4,
		title: "Flerovium",
		origin: 'synthetic',
		type: 'post-transition',
		atomic_mass: 289
	},
	{
		label: 'Mc',            // 115
		period: 7,
		group: 5,
		title: "Moscovium",
		origin: 'synthetic',
		atomic_mass: 289
	},
	{
		label: 'Lv',            // 116
		period: 7,
		group: 6,
		title: "Livermorium",
		origin: 'synthetic',
		atomic_mass: 293
	},
	{
		label: 'Ts',            // 117
		period: 7,
		group: 7,
		title: "Tennessine",
		origin: 'synthetic',
		atomic_mass: 294
	},
	{
		label: 'Og',            // 118
		period: 7,
		group: 8,
		title: "Oganesson",
		origin: 'synthetic',
		atomic_mass: 294
	}
];

element.map = element.reduce(function (res, el, index) {
	if (el) res[el.label] = index;
	return res;
}, {});

module.exports = element;
