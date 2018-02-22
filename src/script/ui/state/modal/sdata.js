/****************************************************************************
 * Copyright 2018 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { sdataSchema, getSdataDefault } from '../../data/schema/sdata-schema';

export const initSdata = () => {
	const context = getSdataDefault();
	const fieldName = getSdataDefault(context);
	const fieldValue = getSdataDefault(context, fieldName);
	const radiobuttons = 'Absolute';

	return {
		errors: {},
		valid: true,
		result: {
			context,
			fieldName,
			fieldValue,
			radiobuttons,
			type: 'DAT'
		}
	};
};

export function sdataReducer(state, action) {
	if (action.data.result.init) {
		return correctErrors({
			...state,
			result: Object.assign({}, state.result, action.data.result)
		}, action.data);
	}

	const actionContext = action.data.result.context;
	const actionFieldName = action.data.result.fieldName;

	let newstate = null;

	if (actionContext !== state.result.context)
		newstate = onContextChange(state, action.data.result);
	else if (actionFieldName !== state.result.fieldName)
		newstate = onFieldNameChange(state, action.data.result);

	newstate = newstate || {
		...state,
		result: Object.assign({}, state.result, action.data.result)
	};

	return correctErrors(newstate, action.data);
}

const correctErrors = (state, payload) => {
	const { valid, errors } = payload;
	const { fieldName, fieldValue } = state.result;

	return {
		result: state.result,
		valid: valid && !!fieldName && !!fieldValue,
		errors
	};
};

const onContextChange = (state, payload) => {
	const { context, fieldValue } = payload;

	const fieldName = getSdataDefault(context);

	let fValue = fieldValue;
	if (fValue === state.result.fieldValue)
		fValue = getSdataDefault(context, fieldName);

	return {
		result: {
			...payload,
			context,
			fieldName,
			fieldValue: fValue
		}
	};
};

const onFieldNameChange = (state, payload) => {
	const { fieldName } = payload;

	const context = state.result.context;

	let fieldValue = payload.fieldValue;

	if (sdataSchema[context][fieldName])
		fieldValue = getSdataDefault(context, fieldName);

	if (fieldValue === state.result.fieldValue && sdataSchema[context][state.result.fieldName])
		fieldValue = '';

	return {
		result: {
			...payload,
			fieldName,
			fieldValue
		}
	};
};
