import { settings as settingsSchema } from '../data/options-schema';

export function defaultOpts() {
	return Object.keys(settingsSchema.properties).reduce((res, prop) => {
		res[prop] = settingsSchema.properties[prop].default;
		return res;
	}, {});
}

export function setDefaultSettings() {
	return {
		type: 'UPDATE_SETTINGS_FORM',
		payload: {
			stateForm: defaultOpts(),
			valid: true,
			errors: {}
		}
	};
}

export function cancelChanges() {
	return {
		type: 'UPDATE_SETTINGS_FORM',
		payload: {
			stateForm: JSON.parse(localStorage.getItem("ketcher-opts")) || defaultOpts(),
			valid: true,
			errors: {}
		}
	};
}
