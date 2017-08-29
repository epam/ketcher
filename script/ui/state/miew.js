import { openDialog, load } from './';
import * as structFormat from '../structformat';

export function miewAction(dispatch, getState) {
	const editor = getState().editor;
	const server = getState().server;
	let convert = structFormat.toString(editor.struct(),
		'cml', server);
	convert.then(function (cml) {
		openDialog(dispatch, 'miew', {
			structStr: cml
		}).then(function (res) {
			if (res.structStr)
				dispatch(load(res.structStr));
		});
	});
}
