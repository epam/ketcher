/* schema utils */
function constant(schema, prop) {
	const desc = schema.properties[prop];
	return desc.constant || desc.enum[0]; // see https://git.io/v6hyP
}

export function mapOf(schema, prop) {
	console.assert(schema.oneOf);
	return schema.oneOf.reduce((res, desc) => {
		res[constant(desc, prop)] = desc;
		return res;
	}, {});
}

export function selectListOf(schema, prop) {
	const desc = schema.properties && schema.properties[prop];
	if (desc) {
		return desc.enum.map((value, i) => {
			const title = desc.enumNames && desc.enumNames[i];
			return title ? { title, value } : value;
		});
	}
	return schema.oneOf.map(ds => (
		!ds.title ? constant(ds, prop) : {
			title: ds.title,
			value: constant(ds, prop)
		}
	));
}
