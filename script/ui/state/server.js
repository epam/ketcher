import { pick } from 'lodash/fp';

import { setStruct } from './options';
import { checkErrors } from './form';
import { serverCall, serverTransform, SERVER_OPTIONS } from '../action/server';

export function recognize(file) {
	return (dispatch, getState) => {
		const recognize = getState().server.recognize;

		let process = recognize(file).then(res => {
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
		const { editor, server } = getState();
		const options = pick(SERVER_OPTIONS, getState().options.settings);
		options.data = { 'types': optsTypes };

		serverCall(editor, server, 'check', options)
			.then(res => dispatch(checkErrors(res)))
			.catch(console.error);
	}
}

export function automap(res) {
	return (dispatch, getState) => {
		const { editor, server } = getState();
		const options = pick(SERVER_OPTIONS, getState().options.settings);
		options.data = res;

		serverTransform(editor, server, 'automap', options)
			.then(res => dispatch(checkErrors(res)))
			.catch(console.error);
	}
}
