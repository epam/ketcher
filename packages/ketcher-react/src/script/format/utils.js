export function ifDef(target, key, value, defaultValue) {
  if (
    value !== undefined &&
    value !== null &&
    value !== defaultValue &&
    !(Array.isArray(value) && value.length === 0)
  )
    target[key] = value
}

// /**
//  * Takes parsed data & match it with format schema
//  * @param source {object}
//  * @param schema {object}
//  * @returns {object}
//  */
// export function schemify(source, schema) {
// 	return schemifyEnv(source, schema, true);
// }
//
// /**
//  * Replace properties according to v3000 format
//  * @param source {object}
//  * @param schema {object}
//  * @returns {object}
//  */
// export function unSchemify(source, schema) {
// 	return schemifyEnv(source, schema, false);
// }
//
// /**
//  * Schemify/unSchemify logic
//  * @param source {object}
//  * @param schema {object}
//  * @param convertToSchema {boolean}
//  * @returns {object}
//  */
// function schemifyEnv(source, schema, convertToSchema) {
// 	const props = schema.properties;
//
// 	if (!props)
// 		return source;
//
// 	return Object.keys(source).reduce((acc, propName) => {
// 		const value = source[propName];
//
// 		if (!props[propName])
// 			throw new Error(`Schema doesn't have property ${propName}`);
//
// 		if (props[propName].type === 'boolean') {
// 			acc[propName] = convertToSchema ? !!value : +value;
// 			return acc;
// 		}
//
// 		if (!props[propName].enum || !props[propName].enumNames) {
// 			acc[propName] = value;
// 			return acc;
// 		}
//
// 		const index = convertToSchema ?
// 			props[propName].enum.findIndex(elem => elem === value) :
// 			props[propName].enumNames.findIndex(elem => elem === value);
//
// 		acc[propName] = convertToSchema ?
// 			props[propName].enumNames[index] :
// 			props[propName].enum[index];
//
// 		return acc;
// 	}, {});
// }
