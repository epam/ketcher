import { capitalize } from 'lodash/fp';
import { basic as basicAtoms } from '../action/atoms';

const initial = {
	freqAtoms: [],
	opened: null
};
const MAX_ATOMS = 7;

export default function (state=initial, action) {
	if (action.type === 'ADD_ATOMS') {
		let atoms = addFreqAtom(action.data, state.freqAtoms);
		return { ...state, freqAtoms: atoms }
	}

	if (action.type === 'OPENED')
		return { ...state, opened: action.data };

	if (action.type === 'UPDATE')
		return { ...state, opened: null };

	return state;
}

function addFreqAtom(label, freqAtoms) {
	label = capitalize(label);
	if (basicAtoms.indexOf(label) > -1 || freqAtoms.indexOf(label) !== -1) return freqAtoms;

	freqAtoms.push(label);
	if (freqAtoms.length > MAX_ATOMS)
		return freqAtoms.slice(1);

	return freqAtoms;
}

export function addAtoms(atomLabel) {
	return {
		type: 'ADD_ATOMS',
		data: atomLabel
	};
}
