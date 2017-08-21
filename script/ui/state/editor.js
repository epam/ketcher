import { debounce } from 'lodash/fp';

import acts from '../action';
import { fromBond, toBond } from '../structconv';

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
		onBondEdit: bond => {
			return openDialog(dispatch, 'bondProps', fromBond(bond))
				.then((res) => toBond(res));
		}
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
