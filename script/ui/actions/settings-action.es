import { settings as settingsSchema } from '../settings-options.es';

export function defaultOpts() {
	return Object.keys(settingsSchema.properties).reduce((res, prop) => {
		res[prop] = settingsSchema.properties[prop].default;
		return res;
	}, {});
}

export function setDefaultSettings() {
	return {
		type: 'SET_DEFAULT_SETTINGS',
		payload: {
			stateForm: defaultOpts(),
			valid: true,
			errors: {}
		}
	};
}

export function cancelChanges() {
	return {
		type: 'CANCEL_SETTINGS',
		payload: {
			stateForm: JSON.parse(localStorage.getItem("ketcher-opts")) || defaultOpts(),
			valid: true,
			errors: {}
		}
	};
}
