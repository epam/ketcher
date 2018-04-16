const rootSchema = {
	id: '/RootGraph',
	type: 'object',
	patternProperties: {
		'^mol-': { $ref: '/Molecule' },
		'^rg-': { $ref: '/RGroup' }
	}
};

module.exports = rootSchema;
