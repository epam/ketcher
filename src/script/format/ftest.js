const jsonschema = require('jsonschema');

const structSchema = require('./structSchema');

const inst = {
	atoms: [
		{
			label: 'O',
			alias: 'myItem',
			location: [1, 1, 1]
		},
		{
			label: 'N',
			isotop: 13,
			location: [2, 2, 2]
		}
	],
	bonds: [
		{
			type: 3,
			atoms: [0, 1],
			stereobox: 1
		}
	]
};

const v = new jsonschema.Validator();

const res = v.validate(inst, structSchema);
console.log(res);

