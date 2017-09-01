/****************************************************************************
 * Copyright (C) 2017 EPAM Systems
 *
 * This file is part of the Ketcher
 * The contents are covered by the terms of the BSD 3-Clause license
 * which is included in the file LICENSE.md, found at the root
 * of the Ketcher source tree.
 ***************************************************************************/

export const basic = ['H', 'C', 'N', 'O', 'S', 'P',
 'F', 'Cl', 'Br', 'I'];

export const atomCuts = {
	"H": "h",
	"C": "c",
	"N": "n",
	"O": "o",
	"S": "s",
	"P": "p",
	"F": "f",
	"Cl": "Shift+c",
	"Br": "Shift+b",
	"I": "i",
	"A": "a"
};

export default Object.keys(atomCuts).reduce((res, label) => {
	res[`atom-${label.toLowerCase()}`] = {
		title: `Atom ${label}`,
		shortcut: atomCuts[label],
		action: {
			tool: 'atom',
			opts: { label }
		}
	};
	return res;
}, {});
