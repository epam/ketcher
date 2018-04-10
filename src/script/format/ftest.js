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
	],
	rgroups: [
		{
			node: 'rg1',
			range: '<9',
			resth: false
		},
		{
			node: 'rg2',
			range: '>10',
			resth: true
		}
	],
	sgroups: [
		{
			type: 'GEN',
			atoms: [0, 1]
		},
		{
			type: 'MUL',
			mul: 2,
			atoms: [0, 1]
		}, {
			type: 'SRU',
			subscript: 'z',
			connectivity: 'HH',
			atoms: [1, 2]
		}
	]
};

const v = new jsonschema.Validator();

const res = v.validate(inst, structSchema);
console.log(res);

