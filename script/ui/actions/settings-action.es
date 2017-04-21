import { settings as settingsSchema } from '../settings-options.es';

function defaultOpts() {
	return Object.keys(settingsSchema.properties).reduce((res, prop) => {
		res[prop] = settingsSchema.properties[prop].default;
		return res;
	}, {});
}

export function setDefaultSettings() {
	return {
		type: 'SET_DEFAULT_SETTINGS',
		payload: { stateForm: defaultOpts() }
	};
}

export function cancelChanges() {
	return {
		type: 'CANCEL_SETTINGS',
		payload: { stateForm: JSON.parse(localStorage.getItem("ketcher-opts")) }
	};
}
