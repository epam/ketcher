import { setStruct } from './options';
import { checkErrors } from './form';

const DEFAULT_OPTIONS = {
	'smart-layout': true,
	'ignore-stereochemistry-errors': true,
	'mass-skip-error-on-pseudoatoms': false,
	'gross-formula-add-rsites': true
};

function mergeDiffOptions(userOpts) {
	let diff = {};
	for (let opt in DEFAULT_OPTIONS) {
		if (userOpts[opt] !== DEFAULT_OPTIONS[opt])
			diff[opt] = userOpts[opt];
	}
	return diff;
}

export function recognize(file) {
	return (dispatch, getState) => {
		const recognize = getState().server.recognize;
		const userOpts = mergeDiffOptions(getState().options.settings);

		let process = recognize(file, userOpts).then(res => {
			dispatch(setStruct(res.struct));
		}, err => {
			dispatch(setStruct(null));
			setTimeout(() => alert("Error! The picture isn't recognized."), 200); // TODO: remove me...
		});
		dispatch(setStruct(process));
	};
}

export function check(optsTypes) {
	return (dispatch, getState) => {
		const check = getState().server.check;
		const userOpts = mergeDiffOptions(getState().options.settings);

		check({ 'types': optsTypes }, userOpts)
			.then(res => dispatch(checkErrors(res)))
			.catch(console.error);
	}
}
