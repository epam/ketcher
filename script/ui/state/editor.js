import { debounce } from 'lodash/fp';

import element from '../../chem/element';
import acts from '../action';
import { fromBond, toBond, fromSgroup, toSgroup, fromElement, toElement } from '../structconv';

export function initEditor(dispatch) {

	const changeAction = debounce(100, () => dispatch(resetToSelect()));
	const updateAction = debounce(100, () => dispatch({ type: 'UPDATE' }));

	return {
		onInit: editor => {
			dispatch({ type: 'INIT', editor });
		},
		onChange: () => {
			changeAction();
		},
		onSelectionChange: () => {
			updateAction();
		},
		onElementEdit: selem => {
			let elem = fromElement(selem);
			let dlg = null;
			if (element.map[elem.label]) {
				dlg = openDialog(dispatch, 'atomProps', elem);
			} else if (Object.keys(elem).length === 1 && 'ap' in elem) {
				dlg = openDialog(dispatch, 'attachmentPoints', elem.ap)
					.then((res) => ({ ap: res }));
			} else if (elem.type === 'list' || elem.type === 'not-list') {
				dlg = openDialog(dispatch, 'period-table', elem)
					.then((res) => {
						// if (!res.type || res.type === 'atom') addAtoms(res.label); // TODO: add atom to toolbar
						return res;
					});
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
				let rgids = [];
				// editor.struct().rgroups.each((rgid) => rgids.push(rgid)); // TODO: get Editor ??
				if (!rgroup.range) rgroup.range = '>0';
				return openDialog(dispatch, 'rgroupLogic',
					Object.assign({ rgroupLabels: rgids }, rgroup));
			}
			return openDialog(dispatch, 'rgroup', rgroup);
		},
		onSgroupEdit: sgroup => {
			return openDialog(dispatch, 'sgroup', fromSgroup(sgroup))
				.then((res) => toSgroup(res));
		},
		onSdataEdit: sgroup => {
			return openDialog(dispatch, sgroup.type === 'DAT' ? 'sgroupSpecial' : 'sgroup', fromSgroup(sgroup))
				.then((res) => toSgroup(res));
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

function openDialog(dispatch, dialogName, props) {
	return new Promise(function (resolve, reject) {
		dispatch({
			type: 'MODAL_OPEN',
			data: {
				name: dialogName,
				prop: {
					...props,
					onResult: (res) => resolve(res),
					onCancel: () => reject()
				}
			}
		})
	});
}

function resetToSelect() {
	return (dispatch, getState) => {
		const resetToSelect = getState().options.settings.resetToSelect;
		const activeTool = getState().actionState.activeTool.tool;
		if (resetToSelect === true || resetToSelect === activeTool) // example: 'paste'
			dispatch({ type: 'ACTION', action: acts['select-lasso'].action });
		else
			dispatch({ type: 'UPDATE' });
	}
}
