export function initAttach(name, attach) {
	return {
		type: 'INIT_ATTACH',
		payload: {
			name,
			atomid: attach.atomid,
			bondid: attach.bondid }
	};
}

export function setAttachPoints(attach) {
	return {
		type: 'SET_ATTACH_POINTS',
		payload: {
			atomid: attach.atomid,
			bondid: attach.bondid
		}
	};
}

export function setTmplName(name) {
	return {
		type: 'SET_TMPL_NAME',
		payload: { name }
	};
}
