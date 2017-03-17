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
		type: 'diatomic'
	},
	{
		label: 'He',            // 2
		period: 1,
		group: 8,
		color: '#d9ffff',
		title: "Helium",
		state: 'gas',
		origin: 'primordial',
		type: 'noble'
	},
	{
		label: 'Li',            // 3
		period: 2,
		group: 1,
		color: '#cc80ff',
		title: "Lithium",
		state: 'solid',
		origin: 'primordial',
		type: 'alkali'
	},
	{
		label: 'Be',            // 4
		period: 2,
		group: 2,
		color: '#c2ff00',
		title: "Beryllium",
		state: 'solid',
		origin: 'primordial',
		type: 'alkaline-earth'
	},
	{
		label: 'B',             // 5
		period: 2,
		group: 3,
		color: '#ffb5b5',
		title: "Boron",
		state: 'solid',
		origin: 'primordial',
		type: 'metalloid'
	},
	{
		label: 'C',             // 6
		period: 2,
		group: 4,
		title: "Carbon",
		state: 'solid',
		origin: 'primordial',
		type: 'polyatomic'
	},
	{
		label: 'N',             // 7
		period: 2,
		group: 5,
		color: '#304ff7',
		title: "Nitrogen",
		state: 'gas',
		origin: 'primordial',
		type: 'diatomic'
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
		type: 'diatomic'
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
		type: 'diatomic'
	},
	{
		label: 'Ne',            // 10
		period: 2,
		group: 8,
		color: '#b3e3f5',
		title: "Neon",
		state: 'gas',
		origin: 'primordial',
		type: 'noble'
	},
	{
		label: 'Na',            // 11
		period: 3,
		group: 1,
		color: '#ab5cf2',
		title: "Sodium",
		state: 'solid',
		origin: 'primordial',
		type: 'alkali'
	},
	{
		label: 'Mg',            // 12
		period: 3,
		group: 2,
		color: '#8aff00',
		title: "Magnesium",
		state: 'solid',
		origin: 'primordial',
		type: 'alkaline-earth'
	},
	{
		label: 'Al',            // 13
		period: 3,
		group: 3,
		color: '#bfa6a6',
		title: "Aluminium",
		state: 'solid',
		origin: 'primordial',
		type: 'post-transition'
	},
	{
		label: 'Si',            // 14
		period: 3,
		group: 4,
		color: '#f0c7a1',
		title: "Silicon",
		state: 'solid',
		origin: 'primordial',
		type: 'metalloid'
	},
	{
		label: 'P',             // 15
		period: 3,
		group: 5,
		color: '#ff8000',
		title: "Phosphorus",
		state: 'solid',
		origin: 'primordial',
		type: 'polyatomic'
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
		type: 'polyatomic'
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
		type: 'diatomic'
	},
	{
		label: 'Ar',            // 18
		period: 3,
		group: 8,
		color: '#80d1e3',
		title: "Argon",
		state: 'gas',
		origin: 'primordial',
		type: 'noble'
	},
	{
		label: 'K',             // 19
		period: 4,
		group: 1,
		color: '#8f40d4',
		title: "Potassium",
		state: 'solid',
		origin: 'primordial',
		type: 'alkali'
	},
	{
		label: 'Ca',            // 20
		period: 4,
		group: 2,
		color: '#3dff00',
		title: "Calcium",
		state: 'solid',
		origin: 'primordial',
		type: 'alkaline-earth'
	},
	{
		label: 'Sc',            // 21
		period: 4,
		group: 3,
		color: '#e6e6e6',
		title: "Scandium",
		state: 'solid',
		origin: 'primordial',
		type: 'transition'
	},
	{
		label: 'Ti',            // 22
		period: 4,
		group: 4,
		color: '#bfc2c7',
		title: "Titanium",
		state: 'solid',
		origin: 'primordial',
		type: 'transition'
	},
	{
		label: 'V',             // 23
		period: 4,
		group: 5,
		color: '#a6a6ab',
		title: "Vanadium",
		state: 'solid',
		origin: 'primordial',
		type: 'transition'
	},
	{
		label: 'Cr',            // 24
		period: 4,
		group: 6,
		color: '#8a99c7',
		title: "Chromium",
		state: 'solid',
		origin: 'primordial',
		type: 'transition'
	},
	{
		label: 'Mn',            // 25
		period: 4,
		group: 7,
		color: '#9c7ac7',
		title: "Manganese",
		state: 'solid',
		origin: 'primordial',
		type: 'transition'
	},
	{
		label: 'Fe',            // 26
		period: 4,
		group: 8,
		color: '#e06633',
		title: "Iron",
		state: 'solid',
		origin: 'primordial',
		type: 'transition'
	},
	{
		label: 'Co',            // 27
		period: 4,
		group: 8,
		color: '#f08fa1',
		title: "Cobalt",
		state: 'solid',
		origin: 'primordial',
		type: 'transition'
	},
	{
		label: 'Ni',            // 28
		period: 4,
		group: 8,
		color: '#4fd14f',
		title: "Nickel",
		state: 'solid',
		origin: 'primordial',
		type: 'transition'
	},
	{
		label: 'Cu',            // 29
		period: 4,
		group: 1,
		color: '#c78033',
		title: "Copper",
		state: 'solid',
		origin: 'primordial',
		type: 'transition'
	},
	{
		label: 'Zn',            // 30
		period: 4,
		group: 2,
		color: '#7d80b0',
		title: "Zinc",
		state: 'solid',
		origin: 'primordial',
		type: 'transition'
	},
	{
		label: 'Ga',            // 31
		period: 4,
		group: 3,
		color: '#c28f8f',
		title: "Gallium",
		state: 'solid',
		origin: 'primordial',
		type: 'post-transition'
	},
	{
		label: 'Ge',            // 32
		period: 4,
		group: 4,
		color: '#668f8f',
		title: "Germanium",
		state: 'solid',
		origin: 'primordial',
		type: 'metalloid'
	},
	{
		label: 'As',            // 33
		period: 4,
		group: 5,
		color: '#bd80e3',
		title: "Arsenic",
		state: 'solid',
		origin: 'primordial',
		type: 'metalloid'
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
		type: 'polyatomic'
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
		type: 'diatomic'
	},
	{
		label: 'Kr',            // 36
		period: 4,
		group: 8,
		color: '#5cb8d1',
		title: "Krypton",
		state: 'gas',
		origin: 'primordial',
		type: 'noble'
	},
	{
		label: 'Rb',            // 37
		period: 5,
		group: 1,
		color: '#702eb0',
		title: "Rubidium",
		state: 'solid',
		origin: 'primordial',
		type: 'alkali'
	},
	{
		label: 'Sr',            // 38
		period: 5,
		group: 2,
		color: '#00ff00',
		title: "Strontium",
		state: 'solid',
		origin: 'primordial',
		type: 'alkaline-earth'
	},
	{
		label: 'Y',             // 39
		period: 5,
		group: 3,
		color: '#94ffff',
		title: "Yttrium",
		state: 'solid',
		origin: 'primordial',
		type: 'transition'
	},
	{
		label: 'Zr',            // 40
		period: 5,
		group: 4,
		color: '#94e0e0',
		title: "Zirconium",
		state: 'solid',
		origin: 'primordial',
		type: 'transition'
	},
	{
		label: 'Nb',            // 41
		period: 5,
		group: 5,
		color: '#73c2c9',
		title: "Niobium",
		state: 'solid',
		origin: 'primordial',
		type: 'transition'
	},
	{
		label: 'Mo',            // 42
		period: 5,
		group: 6,
		color: '#54b5b5',
		title: "Molybdenum",
		state: 'solid',
		origin: 'primordial',
		type: 'transition'
	},
	{
		label: 'Tc',            // 43
		period: 5,
		group: 7,
		color: '#3b9e9e',
		title: "Technetium",
		state: 'solid',
		origin: 'decay',
		type: 'transition'
	},
	{
		label: 'Ru',            // 44
		period: 5,
		group: 8,
		color: '#248f8f',
		title: "Ruthenium",
		state: 'solid',
		origin: 'primordial',
		type: 'transition'
	},
	{
		label: 'Rh',            // 45
		period: 5,
		group: 8,
		color: '#0a7d8c',
		title: "Rhodium",
		state: 'solid',
		origin: 'primordial',
		type: 'transition'
	},
	{
		label: 'Pd',            // 46
		period: 5,
		group: 8,
		color: '#006985',
		title: "Palladium",
		state: 'solid',
		origin: 'primordial',
		type: 'transition'
	},
	{
		label: 'Ag',            // 47
		period: 5,
		group: 1,
		color: '#bfbfbf',
		title: "Silver",
		state: 'solid',
		origin: 'primordial',
		type: 'transition'
	},
	{
		label: 'Cd',            // 48
		period: 5,
		group: 2,
		color: '#ffd98f',
		title: "Cadmium",
		state: 'solid',
		origin: 'primordial',
		type: 'transition'
	},
	{
		label: 'In',            // 49
		period: 5,
		group: 3,
		color: '#a67573',
		title: "Indium",
		state: 'solid',
		origin: 'primordial',
		type: 'post-transition'
	},
	{
		label: 'Sn',            // 50
		period: 5,
		group: 4,
		color: '#668080',
		title: "Tin",
		state: 'solid',
		origin: 'primordial',
		type: 'post-transition'
	},
	{
		label: 'Sb',            // 51
		period: 5,
		group: 5,
		color: '#9e63b5',
		title: "Antimony",
		state: 'solid',
		origin: 'primordial',
		type: 'metalloid'
	},
	{
		label: 'Te',            // 52
		period: 5,
		group: 6,
		color: '#d47a00',
		title: "Tellurium",
		state: 'solid',
		origin: 'primordial',
		type: 'metalloid'
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
		type: 'diatomic'
	},
	{
		label: 'Xe',            // 54
		period: 5,
		group: 8,
		color: '#429eb0',
		title: "Xenon",
		state: 'gas',
		origin: 'primordial',
		type: 'noble'
	},
	{
		label: 'Cs',            // 55
		period: 6,
		group: 1,
		color: '#57178f',
		title: "Caesium",
		state: 'solid',
		origin: 'primordial',
		type: 'alkali'
	},
	{
		label: 'Ba',            // 56
		period: 6,
		group: 2,
		color: '#00c900',
		title: "Barium",
		state: 'solid',
		origin: 'primordial',
		type: 'alkaline-earth'
	},
	{
		label: 'La',            // 57
		period: 6,
		group: 3,
		color: '#70d4ff',
		title: "Lanthanum",
		state: 'solid',
		origin: 'primordial',
		type: 'lanthanide'
	},
	{
		label: 'Ce',            // 58
		period: 6,
		group: 3,
		color: '#ffffc7',
		title: "Cerium",
		state: 'solid',
		origin: 'primordial',
		type: 'lanthanide'
	},
	{
		label: 'Pr',            // 59
		period: 6,
		group: 3,
		color: '#d9ffc7',
		title: "Praseodymium",
		state: 'solid',
		origin: 'primordial',
		type: 'lanthanide'
	},
	{
		label: 'Nd',            // 60
		period: 6,
		group: 3,
		color: '#c7ffc7',
		title: "Neodymium",
		state: 'solid',
		origin: 'primordial',
		type: 'lanthanide'
	},
	{
		label: 'Pm',            // 61
		period: 6,
		group: 3,
		color: '#a3ffc7',
		title: "Promethium",
		state: 'solid',
		origin: 'decay',
		type: 'lanthanide'
	},
	{
		label: 'Sm',            // 62
		period: 6,
		group: 3,
		color: '#8fffc7',
		title: "Samarium",
		state: 'solid',
		origin: 'primordial',
		type: 'lanthanide'
	},
	{
		label: 'Eu',            // 63
		period: 6,
		group: 3,
		color: '#61ffc7',
		title: "Europium",
		state: 'solid',
		origin: 'primordial',
		type: 'lanthanide'
	},
	{
		label: 'Gd',            // 64
		period: 6,
		group: 3,
		color: '#45ffc7',
		title: "Gadolinium",
		state: 'solid',
		origin: 'primordial',
		type: 'lanthanide'
	},
	{
		label: 'Tb',            // 65
		period: 6,
		group: 3,
		color: '#30ffc7',
		title: "Terbium",
		state: 'solid',
		origin: 'primordial',
		type: 'lanthanide'
	},
	{
		label: 'Dy',            // 66
		period: 6,
		group: 3,
		color: '#1fffc7',
		title: "Dysprosium",
		state: 'solid',
		origin: 'primordial',
		type: 'lanthanide'
	},
	{
		label: 'Ho',            // 67
		period: 6,
		group: 3,
		color: '#00ff9c',
		title: "Holmium",
		state: 'solid',
		origin: 'primordial',
		type: 'lanthanide'
	},
	{
		label: 'Er',            // 68
		period: 6,
		group: 3,
		color: '#00e675',
		title: "Erbium",
		state: 'solid',
		origin: 'primordial',
		type: 'lanthanide'
	},
	{
		label: 'Tm',            // 69
		period: 6,
		group: 3,
		color: '#00d452',
		title: "Thulium",
		state: 'solid',
		origin: 'primordial',
		type: 'lanthanide'
	},
	{
		label: 'Yb',            // 70
		period: 6,
		group: 3,
		color: '#00bf38',
		title: "Ytterbium",
		state: 'solid',
		origin: 'primordial',
		type: 'lanthanide'
	},
	{
		label: 'Lu',            // 71
		period: 6,
		group: 3,
		color: '#00ab24',
		title: "Lutetium",
		state: 'solid',
		origin: 'primordial',
		type: 'lanthanide'
	},
	{
		label: 'Hf',            // 72
		period: 6,
		group: 4,
		color: '#4dc2ff',
		title: "Hafnium",
		state: 'solid',
		origin: 'primordial',
		type: 'transition'
	},
	{
		label: 'Ta',            // 73
		period: 6,
		group: 5,
		color: '#4da6ff',
		title: "Tantalum",
		state: 'solid',
		origin: 'primordial',
		type: 'transition'
	},
	{
		label: 'W',             // 74
		period: 6,
		group: 6,
		color: '#2194d6',
		title: "Tungsten",
		state: 'solid',
		origin: 'primordial',
		type: 'transition'
	},
	{
		label: 'Re',            // 75
		period: 6,
		group: 7,
		color: '#267dab',
		title: "Rhenium",
		state: 'solid',
		origin: 'primordial',
		type: 'transition'
	},
	{
		label: 'Os',            // 76
		period: 6,
		group: 8,
		color: '#266696',
		title: "Osmium",
		state: 'solid',
		origin: 'primordial',
		type: 'transition'
	},
	{
		label: 'Ir',            // 77
		period: 6,
		group: 8,
		color: '#175487',
		title: "Iridium",
		state: 'solid',
		origin: 'primordial',
		type: 'transition'
	},
	{
		label: 'Pt',            // 78
		period: 6,
		group: 8,
		color: '#d1d1e0',
		title: "Platinum",
		state: 'solid',
		origin: 'primordial',
		type: 'transition'
	},
	{
		label: 'Au',            // 79
		period: 6,
		group: 1,
		color: '#ffd124',
		title: "Gold",
		state: 'solid',
		origin: 'primordial',
		type: 'transition'
	},
	{
		label: 'Hg',            // 80
		period: 6,
		group: 2,
		color: '#b8b8d1',
		title: "Mercury",
		state: 'liquid',
		origin: 'primordial',
		type: 'transition'
	},
	{
		label: 'Tl',            // 81
		period: 6,
		group: 3,
		color: '#a6544d',
		title: "Thallium",
		state: 'solid',
		origin: 'primordial',
		type: 'post-transition'
	},
	{
		label: 'Pb',            // 82
		period: 6,
		group: 4,
		color: '#575961',
		title: "Lead",
		state: 'solid',
		origin: 'primordial',
		type: 'post-transition'
	},
	{
		label: 'Bi',            // 83
		period: 6,
		group: 5,
		color: '#9e4fb5',
		title: "Bismuth",
		state: 'solid',
		origin: 'primordial',
		type: 'post-transition'
	},
	{
		label: 'Po',            // 84
		period: 6,
		group: 6,
		color: '#ab5c00',
		title: "Polonium",
		state: 'solid',
		origin: 'decay',
		type: 'post-transition'
	},
	{
		label: 'At',            // 85
		period: 6,
		group: 7,
		color: '#754f45',
		title: "Astatine",
		state: 'solid',
		origin: 'decay',
		type: 'metalloid'
	},
	{
		label: 'Rn',            // 86
		period: 6,
		group: 8,
		color: '#428296',
		title: "Radon",
		state: 'gas',
		origin: 'decay',
		type: 'noble'
	},
	{
		label: 'Fr',            // 87
		period: 7,
		group: 1,
		color: '#420066',
		title: "Francium",
		state: 'solid',
		origin: 'decay',
		type: 'alkali'
	},
	{
		label: 'Ra',            // 88
		period: 7,
		group: 2,
		color: '#007d00',
		title: "Radium",
		state: 'solid',
		origin: 'decay',
		type: 'alkaline-earth'
	},
	{
		label: 'Ac',            // 89
		period: 7,
		group: 3,
		color: '#70abfa',
		title: "Actinium",
		state: 'solid',
		origin: 'decay',
		type: 'actinide'
	},
	{
		label: 'Th',            // 90
		period: 7,
		group: 3,
		color: '#00baff',
		title: "Thorium",
		state: 'solid',
		origin: 'primordial',
		type: 'actinide'
	},
	{
		label: 'Pa',            // 91
		period: 7,
		group: 3,
		color: '#00a1ff',
		title: "Protactinium",
		state: 'solid',
		origin: 'decay',
		type: 'actinide'
	},
	{
		label: 'U',             // 92
		period: 7,
		group: 3,
		color: '#008fff',
		title: "Uranium",
		state: 'solid',
		origin: 'primordial',
		type: 'actinide'
	},
	{
		label: 'Np',            // 93
		period: 7,
		group: 3,
		color: '#0080ff',
		title: "Neptunium",
		state: 'solid',
		origin: 'decay',
		type: 'actinide'
	},
	{
		label: 'Pu',            // 94
		period: 7,
		group: 3,
		color: '#006bff',
		title: "Plutonium",
		state: 'solid',
		origin: 'decay',
		type: 'actinide'
	},
	{
		label: 'Am',            // 95
		period: 7,
		group: 3,
		color: '#545cf2',
		title: "Americium",
		state: 'solid',
		origin: 'synthetic',
		type: 'actinide'
	},
	{
		label: 'Cm',            // 96
		period: 7,
		group: 3,
		color: '#785ce3',
		title: "Curium",
		state: 'solid',
		origin: 'synthetic',
		type: 'actinide'
	},
	{
		label: 'Bk',            // 97
		period: 7,
		group: 3,
		color: '#8a4fe3',
		title: "Berkelium",
		state: 'solid',
		origin: 'synthetic',
		type: 'actinide'
	},
	{
		label: 'Cf',            // 98
		period: 7,
		group: 3,
		color: '#a136d4',
		title: "Californium",
		state: 'solid',
		origin: 'synthetic',
		type: 'actinide'
	},
	{
		label: 'Es',            // 99
		period: 7,
		group: 3,
		color: '#b31fd4',
		title: "Einsteinium",
		state: 'solid',
		origin: 'synthetic',
		type: 'actinide'
	},
	// TODO: fix colors for the elements below
	{
		label: 'Fm',            // 100
		period: 7,
		group: 3,
		title: "Fermium",
		origin: 'synthetic',
		type: 'actinide'
	},
	{
		label: 'Md',            // 101
		period: 7,
		group: 3,
		title: "Mendelevium",
		origin: 'synthetic',
		type: 'actinide'
	},
	{
		label: 'No',            // 102
		period: 7,
		group: 3,
		title: "Nobelium",
		origin: 'synthetic',
		type: 'actinide'
	},
	{
		label: 'Lr',            // 103
		period: 7,
		group: 3,
		title: "Lawrencium",
		origin: 'synthetic',
		type: 'actinide'
	},
	{
		label: 'Rf',            // 104
		period: 7,
		group: 4,
		color: '#4dc2ff',
		title: "Rutherfordium",
		origin: 'synthetic',
		type: 'transition'
	},
	{
		label: 'Db',            // 105
		period: 7,
		group: 5,
		color: '#4da6ff',
		title: "Dubnium",
		origin: 'synthetic',
		type: 'transition'
	},
	{
		label: 'Sg',            // 106
		period: 7,
		group: 6,
		color: '#2194d6',
		title: "Seaborgium",
		origin: 'synthetic',
		type: 'transition'
	},
	{
		label: 'Bh',            // 107
		period: 7,
		group: 7,
		color: '#267dab',
		title: "Bohrium",
		origin: 'synthetic',
		type: 'transition'
	},
	{
		label: 'Hs',            // 108
		period: 7,
		group: 8,
		color: '#266696',
		title: "Hassium",
		origin: 'synthetic',
		type: 'transition'
	},
	{
		label: 'Mt',            // 109
		period: 7,
		group: 8,
		color: '#175487',
		title: "Meitnerium",
		origin: 'synthetic'
	},
	{
		label: 'Ds',            // 110
		period: 7,
		group: 8,
		color: '#d1d1e0',
		title: "Darmstadtium",
		origin: 'synthetic'
	},
	{
		label: 'Rg',            // 111
		period: 7,
		group: 1,
		color: '#ffd124',
		title: "Roentgenium",
		origin: 'synthetic'
	},
	{
		label: 'Cn',            // 112
		period: 7,
		group: 2,
		color: '#b8b8d1',
		title: "Copernicium",
		origin: 'synthetic',
		type: 'transition'
	},
	{
		label: 'Nh',            // 113
		period: 7,
		group: 3,
		title: "Nihonium",
		origin: 'synthetic'
	},
	{
		label: 'Fl',            // 114
		period: 7,
		group: 4,
		title: "Flerovium",
		origin: 'synthetic',
		type: 'post-transition'
	},
	{
		label: 'Mc',            // 115
		period: 7,
		group: 5,
		title: "Moscovium",
		origin: 'synthetic'
	},
	{
		label: 'Lv',            // 116
		period: 7,
		group: 6,
		title: "Livermorium",
		origin: 'synthetic'
	},
	{
		label: 'Ts',            // 117
		period: 7,
		group: 7,
		title: "Tennessine",
		origin: 'synthetic'
	},
	{
		label: 'Og',            // 118
		period: 7,
		group: 8,
		title: "Oganesson",
		origin: 'synthetic'
	}
];

element.map = element.reduce(function (res, el, index) {
	if (el) res[el.label] = index;
	return res;
}, {});

module.exports = element;
