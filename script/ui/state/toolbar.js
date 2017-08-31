import { capitalize, debounce, isEqual } from 'lodash/fp';
import { basic as basicAtoms } from '../action/atoms';
import tools from '../action/tools';

const initial = {
	freqAtoms: [],
	currentAtom: 0,
	opened: null,
	visibleTools: {}
};
const MAX_ATOMS = 7;

export function initResize() {
	return function (dispatch) {
		const onResize = debounce(100, () => dispatch({ type: 'CLEAR_VISIBLE' }));

		addEventListener('resize', onResize);
	}
}

export default function (state=initial, action) {
	let { type, data } = action;

	switch (type) {
		case 'ACTION':
			let visibleTool = toolInMenu(action.action);
			return visibleTool
				? { ...state, opened: null, visibleTools: { ...state.visibleTools, ...visibleTool } }
				: state;
		case 'ADD_ATOMS':
			const newState = addFreqAtom(data, state.freqAtoms, state.currentAtom);
			return { ...state, ...newState };
		case 'CLEAR_VISIBLE':
			return { ...state, opened: null, visibleTools: {} };
		case 'OPENED':
			return { ...state, opened: data };
		case 'UPDATE':
			return { ...state, opened: null };
		default:
			return state;
	}
}

function addFreqAtom(label, freqAtoms, index) {
	label = capitalize(label);
	if (basicAtoms.indexOf(label) > -1 || freqAtoms.indexOf(label) !== -1) return { freqAtoms };

	freqAtoms[index] = label;
	index = (index + 1) % MAX_ATOMS;

	return { freqAtoms, currentAtom: index };
}

export function addAtoms(atomLabel) {
	return {
		type: 'ADD_ATOMS',
		data: atomLabel
	};
}

function getToolFromAction(action) {
	let tool = null;

	for (let toolName in tools) {
		if (tools.hasOwnProperty(toolName) && isEqual(action, tools[toolName].action))
			tool = toolName;
	}

	return tool;
}

function toolInMenu(action) {
	let tool = getToolFromAction(action);

	let sel = document.getElementById(tool);
	let dropdown = sel && hiddenAncestor(sel);

	return dropdown ? { [dropdown.id]: sel.id } : null;
}

export function hiddenAncestor(el, base) {
	base = base || document.body;
	let findEl = el;

	while (window.getComputedStyle(findEl).overflow !== 'hidden' && !findEl.classList.contains('opened')) {
		if (findEl === base) return null;
		findEl = findEl.parentNode;
	}

	return findEl;
}
