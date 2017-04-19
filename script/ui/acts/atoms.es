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
			opts: label
		}
	};
	return res;
}, {});
