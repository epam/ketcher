import { mapOf } from '../component/form';
import { sgroupSpecial as sgroupSchema } from '../sgroupSpecialSchema.es'

const contextSchema = {
	title: 'Context',
	enum: [
		'Fragment',
		'Single Bond',
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

const firstObjKey = obj => Object.keys(obj)[0];
const defaultContext = () => firstObjKey(schemes);
const defaultFieldName = context => firstObjKey(schemes[context]);
const defaultFieldValue = (context, fieldName) => schemes[context][fieldName] ?
	schemes[context][fieldName].properties.fieldValue.default :
	'';

const initState = () => {
	const context = defaultContext();
	const fieldName = defaultFieldName(context);
	const fieldValue = defaultFieldValue(context, fieldName);
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
	}
};

export default function sgroupSpecialReducer(state = initState(), action) {
	if (action.type === 'UPDATE_SGROUPSPEC_FORM') {
		const actionContext = action.payload.stateForm['context'];
		const actionFieldName = action.payload.stateForm['fieldName'];

		if (actionContext !== undefined && actionContext !== state.stateForm.context || actionFieldName === undefined)
			return onContextChange(state, action.payload, actionContext);
		if (actionFieldName !== state.stateForm.fieldName)
			return onFieldNameChange(state, action.payload, actionFieldName);

		return Object.assign({}, state, action.payload);
	}

	return state;
}

const onContextChange = (state, payload, context) => {
	const fieldName = defaultFieldName(context);
	const fieldValue = defaultFieldValue(context, fieldName);

	return {
		...state,
		...payload,
		stateForm: {
			...state.stateForm,
			context,
			fieldName,
			fieldValue
		}
	}
};

const onFieldNameChange = (state, payload, fieldName) => {
	const context = state.stateForm.context;
	const fieldValue = defaultFieldValue(context, fieldName);
	if (!fieldValue) payload.errors.fieldValue = "does not meet minimum length of 1";

	return {
		...state,
		valid: !fieldValue ? false : payload.valid,
		errors: payload.errors,
		stateForm: {
			...state.stateForm,
			fieldName,
			fieldValue
		}
	}
};
