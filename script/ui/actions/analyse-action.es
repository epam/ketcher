export function changeRound(roundName, value) {
	return {
		type: 'CHANGE_ANALYSE_ROUND',
		payload: { [roundName]: value }
	};
}
