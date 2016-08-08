function el(label, period, group, putHydrogenOnTheLeft, color) { // eslint-disable-line max-params
	return {
		label: label,
		period: period,
		group: group,
		putHydrogenOnTheLeft: putHydrogenOnTheLeft,
		color: color || '#000000'
	};
}

var element = [
	null,
	el('H', 1, 1, false, '#000000'), // 1
	el('He', 1, 8, false, '#d9ffff'), // 2
	el('Li', 2, 1, false, '#cc80ff'), // 3
	el('Be', 2, 2, false, '#c2ff00'), // 4
	el('B', 2, 3, false, '#ffb5b5'), // 5
	el('C', 2, 4, false, '#000000'), // 6
	el('N', 2, 5, false, '#304ff7'), // 7
	el('O', 2, 6, true, '#ff0d0d'), // 8
	el('F', 2, 7, true, '#8fe04f'), // 9
	el('Ne', 2, 8, false, '#b3e3f5'), // 10
	el('Na', 3, 1, false, '#ab5cf2'), // 11
	el('Mg', 3, 2, false, '#8aff00'), // 12
	el('Al', 3, 3, false, '#bfa6a6'), // 13
	el('Si', 3, 4, false, '#f0c7a1'), // 14
	el('P', 3, 5, false, '#ff8000'), // 15
	el('S', 3, 6, true, '#d9a61a'), // 16
	el('Cl', 3, 7, true, '#1fd01f'), // 17
	el('Ar', 3, 8, false, '#80d1e3'), // 18
	el('K', 4, 1, false, '#8f40d4'), // 19
	el('Ca', 4, 2, false, '#3dff00'), // 20
	el('Sc', 4, 3, false, '#e6e6e6'), // 21
	el('Ti', 4, 4, false, '#bfc2c7'), // 22
	el('V', 4, 5, false, '#a6a6ab'), // 23
	el('Cr', 4, 6, false, '#8a99c7'), // 24
	el('Mn', 4, 7, false, '#9c7ac7'), // 25
	el('Fe', 4, 8, false, '#e06633'), // 26
	el('Co', 4, 8, false, '#f08fa1'), // 27
	el('Ni', 4, 8, false, '#4fd14f'), // 28
	el('Cu', 4, 1, false, '#c78033'), // 29
	el('Zn', 4, 2, false, '#7d80b0'), // 30
	el('Ga', 4, 3, false, '#c28f8f'), // 31
	el('Ge', 4, 4, false, '#668f8f'), // 32
	el('As', 4, 5, false, '#bd80e3'), // 33
	el('Se', 4, 6, true, '#ffa100'), // 34
	el('Br', 4, 7, true, '#a62929'), // 35
	el('Kr', 4, 8, false, '#5cb8d1'), // 36
	el('Rb', 5, 1, false, '#702eb0'), // 37
	el('Sr', 5, 2, false, '#00ff00'), // 38
	el('Y', 5, 3, false, '#94ffff'), // 39
	el('Zr', 5, 4, false, '#94e0e0'), // 40
	el('Nb', 5, 5, false, '#73c2c9'), // 41
	el('Mo', 5, 6, false, '#54b5b5'), // 42
	el('Tc', 5, 7, false, '#3b9e9e'), // 43
	el('Ru', 5, 8, false, '#248f8f'), // 44
	el('Rh', 5, 8, false, '#0a7d8c'), // 45
	el('Pd', 5, 8, false, '#006985'), // 46
	el('Ag', 5, 1, false, '#bfbfbf'), // 47
	el('Cd', 5, 2, false, '#ffd98f'), // 48
	el('In', 5, 3, false, '#a67573'), // 49
	el('Sn', 5, 4, false, '#668080'), // 50
	el('Sb', 5, 5, false, '#9e63b5'), // 51
	el('Te', 5, 6, false, '#d47a00'), // 52
	el('I', 5, 7, true, '#940094'), // 53
	el('Xe', 5, 8, false, '#429eb0'), // 54
	el('Cs', 6, 1, false, '#57178f'), // 55
	el('Ba', 6, 2, false, '#00c900'), // 56
	el('La', 6, 3, false, '#70d4ff'), // 57
	el('Ce', 6, 3, false, '#ffffc7'), // 58
	el('Pr', 6, 3, false, '#d9ffc7'), // 59
	el('Nd', 6, 3, false, '#c7ffc7'), // 60
	el('Pm', 6, 3, false, '#a3ffc7'), // 61
	el('Sm', 6, 3, false, '#8fffc7'), // 62
	el('Eu', 6, 3, false, '#61ffc7'), // 63
	el('Gd', 6, 3, false, '#45ffc7'), // 64
	el('Tb', 6, 3, false, '#30ffc7'), // 65
	el('Dy', 6, 3, false, '#1fffc7'), // 66
	el('Ho', 6, 3, false, '#00ff9c'), // 67
	el('Er', 6, 3, false, '#00e675'), // 68
	el('Tm', 6, 3, false, '#00d452'), // 69
	el('Yb', 6, 3, false, '#00bf38'), // 70
	el('Lu', 6, 3, false, '#00ab24'), // 71
	el('Hf', 6, 4, false, '#4dc2ff'), // 72
	el('Ta', 6, 5, false, '#4da6ff'), // 73
	el('W', 6, 6, false, '#2194d6'), // 74
	el('Re', 6, 7, false, '#267dab'), // 75
	el('Os', 6, 8, false, '#266696'), // 76
	el('Ir', 6, 8, false, '#175487'), // 77
	el('Pt', 6, 8, false, '#d1d1e0'), // 78
	el('Au', 6, 1, false, '#ffd124'), // 79
	el('Hg', 6, 2, false, '#b8b8d1'), // 80
	el('Tl', 6, 3, false, '#a6544d'), // 81
	el('Pb', 6, 4, false, '#575961'), // 82
	el('Bi', 6, 5, false, '#9e4fb5'), // 83
	el('Po', 6, 6, false, '#ab5c00'), // 84
	el('At', 6, 7, false, '#754f45'), // 85
	el('Rn', 6, 8, false, '#428296'), // 86
	el('Fr', 7, 1, false, '#420066'), // 87
	el('Ra', 7, 2, false, '#007d00'), // 88
	el('Ac', 7, 3, false, '#70abfa'), // 89
	el('Th', 7, 3, false, '#00baff'), // 90
	el('Pa', 7, 3, false, '#00a1ff'), // 91
	el('U', 7, 3, false, '#008fff'), // 92
	el('Np', 7, 3, false, '#0080ff'), // 93
	el('Pu', 7, 3, false, '#006bff'), // 94
	el('Am', 7, 3, false, '#545cf2'), // 95
	el('Cm', 7, 3, false, '#785ce3'), // 96
	el('Bk', 7, 3, false, '#8a4fe3'), // 97
	el('Cf', 7, 3, false, '#a136d4'), // 98
	el('Es', 7, 3, false, '#b31fd4'), // 99
	// TODO need to fix colors for the elements below
	el('Fm', 7, 3, false, '#000000'), // 100
	el('Md', 7, 3, false, '#000000'), // 101
	el('No', 7, 3, false, '#000000'), // 102
	el('Lr', 7, 3, false, '#000000'), // 103
	el('Rf', 7, 4, false, '#4dc2ff'), // 104
	el('Db', 7, 5, false, '#4da6ff'), // 105
	el('Sg', 7, 6, false, '#2194d6'), // 106
	el('Bh', 7, 7, false, '#267dab'), // 107
	el('Hs', 7, 8, false, '#266696'), // 108
	el('Mt', 7, 8, false, '#175487'), // 109
	el('Ds', 7, 8, false, '#d1d1e0'), // 110
	el('Rg', 7, 1, false, '#ffd124'), // 111
	el('Cn', 7, 2, false, '#b8b8d1'), // 112
	el('Uut', 7, 3, false), // 113
	el('Fl', 7, 4, false), // 114
	el('Uup', 7, 5, false), // 115
	el('Lv', 7, 6, false), // 116
	el('Uus', 7, 7, false), // 117
	el('Uuo', 7, 8, false) // 118
];

var labelMap = element.reduce(function (res, el, index) {
	if (el) res[el.label] = index;
	return res;
}, {});

element.getElementByLabel = function (label) {
	return labelMap[label] || null;
};

module.exports = element;
