export function checkErrors(dispatch, check, optsTypes) {

	check({ 'types': optsTypes })
		.then(res => dispatch({
			type: 'CHECK_ERRORS',
			payload: { moleculeErrors: res }
		}))
		.catch(console.error);
}
