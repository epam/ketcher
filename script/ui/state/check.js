export function checkErrors(dispatch, check, optsTypes) {

	check({ 'types': optsTypes })
		.then(res => dispatch({
			type: 'UPDATE_CHECK_FORM',
			payload: { moleculeErrors: res }
		}))
		.catch(console.error);
}
