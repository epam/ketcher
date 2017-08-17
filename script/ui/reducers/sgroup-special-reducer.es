import { mapOf } from '../component/form';
import { sgroupSpecial as sgroupSchema } from '../sgroupSpecialSchema.es';
import { getSchemaDefault } from '../utils';

const contextSchema = {
	title: 'Context',
	enum: [
		'Fragment',
		'Bond',
		'Atom',
		'Group'
	],
	default: 'Fragment'
};

const schemes = Object.keys(sgroupSchema).reduce((acc, title) => {
	acc[title] = mapOf(sgroupSchema[title], 'fieldName');
	Object.keys(acc[title]).forEach(fieldName => acc[title][fieldName].properties.context = contextSchema);
	return acc;
}, {});

const initState = () => {
	const context = getSchemaDefault(schemes);
	const fieldName = getSchemaDefault(schemes, context);
	const fieldValue = getSchemaDefault(schemes, context, fieldName);
	const radiobuttons = 'Absolute';

	return {
		schema: schemes,
		stateForm: {
			context,
			fieldName,
			fieldValue,
			radiobuttons,
			type: 'DAT'
		}
	};
};

export default function sgroupSpecialReducer(state = initState(), action) {
	if (action.type === 'UPDATE_SGROUPSPEC_FORM') {
		if (action.payload.stateForm.init)
			return correctErrors(Object.assign({}, state, action.payload), action.payload);

		const actionContext = action.payload.stateForm.context;
		const actionFieldName = action.payload.stateForm.fieldName;

		let newstate = null;

		if (actionContext !== state.stateForm.context)
			newstate = onContextChange(state, action.payload.stateForm);
		else if (actionFieldName !== state.stateForm.fieldName)
			newstate = onFieldNameChange(state, action.payload.stateForm);

		newstate = newstate || Object.assign({}, state, action.payload);

		return correctErrors(newstate, action.payload);
	}

	return state;
}

const correctErrors = (state, payload) => {
	let { valid, errors } = payload;
	let { fieldName, fieldValue } = state.stateForm;

	return {
		...state,
		valid: valid && fieldName && fieldValue,
		errors: errors,
	};
};

const onContextChange = (state, payload) => {
	const { context, fieldValue } = payload;

	const fieldName = getSchemaDefault(schemes, context);

	let fValue = fieldValue;
	if (fValue === state.stateForm.fieldValue)
		fValue = getSchemaDefault(schemes, context, fieldName);

	return {
		schema: state.schema,
		stateForm: {
			...payload,
			context,
			fieldName,
			fieldValue: fValue
		}
	};
};

const onFieldNameChange = (state, payload) => {
	let { fieldName } = payload;

	const context = state.stateForm.context;

	let fieldValue = payload.fieldValue;

	if (schemes[context][fieldName])
		fieldValue = fieldValue || getSchemaDefault(schemes, context, fieldName);

	if (fieldValue === state.stateForm.fieldValue)
		fieldValue = '';

	return {
		schema: state.schema,
		stateForm: {
			...payload,
			fieldName,
			fieldValue,
		}
	};
};
