import { debounce } from 'lodash/fp';

import element from '../../chem/element';
import acts from '../action';
import { openDialog } from './';
import { fromBond, toBond, fromSgroup, toSgroup, fromElement, toElement } from '../structconv';

export function initEditor(dispatch, getState) {
	const updateAction = debounce(100, () => dispatch({ type: 'UPDATE' }));
	const sleep = (time) => new Promise(resolve => setTimeout(resolve, time));

	function resetToSelect(dispatch, getState) {
		const resetToSelect = getState().options.settings.resetToSelect;
		const activeTool = getState().actionState.activeTool.tool;
		if (resetToSelect === true || resetToSelect === activeTool) // example: 'paste'
			dispatch({ type: 'ACTION', action: acts['select-lasso'].action });
		else
			updateAction();
	}

	return {
		onInit: editor => {
			dispatch({ type: 'INIT', editor });
		},
		onChange: () => {
			dispatch(resetToSelect);
		},
		onSelectionChange: () => {
			updateAction();
		},
		onElementEdit: selem => {
			const elem = fromElement(selem);
			let dlg = null;

			if (element.map[elem.label]) {
				dlg = openDialog(dispatch, 'atomProps', elem);
			} else if (Object.keys(elem).length === 1 && 'ap' in elem) {
				dlg = openDialog(dispatch, 'attachmentPoints', elem.ap)
					.then((res) => ({ ap: res }));
			} else if (elem.type === 'list' || elem.type === 'not-list') {
				dlg = openDialog(dispatch, 'period-table', elem);
			} else if (elem.type === 'rlabel') {
				dlg = openDialog(dispatch, 'rgroup', elem);
			} else {
				dlg = openDialog(dispatch, 'period-table', elem);
			}

			return dlg.then((res) => toElement(res));
		},
		onQuickEdit: atom => {
			return openDialog(dispatch, 'labelEdit', atom)
		},
		onBondEdit: bond => {
			return openDialog(dispatch, 'bondProps', fromBond(bond))
				.then((res) => toBond(res));
		},
		onRgroupEdit: rgroup => {
			if (Object.keys(rgroup).length > 1) {
				const rgids = [];
				getState().editor.struct().rgroups.each((rgid) => rgids.push(rgid));

				if (!rgroup.range) rgroup.range = '>0';

				return openDialog(dispatch, 'rgroupLogic',
					Object.assign({ rgroupLabels: rgids }, rgroup));
			}
			return openDialog(dispatch, 'rgroup', rgroup);
		},
		onSgroupEdit: sgroup => {
			return sleep(0)		// huck to open dialog after dispatch sgroup tool action
				.then(() => openDialog(dispatch, 'sgroup', fromSgroup(sgroup)))
				.then(toSgroup);
		},
		onSdataEdit: sgroup => {
			return sleep(0)
				.then(() => openDialog(dispatch, sgroup.type === 'DAT' ? 'sdata' : 'sgroup', fromSgroup(sgroup)))
				.then(toSgroup);
		},
		onMessage: msg => {
			if (msg.error)
				alert(msg.error);
			else {
				let act = Object.keys(msg)[0];
				console[act](msg[act]);
			}
		},
		omMouseDown: event => {}
	};
}
