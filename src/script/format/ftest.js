const jsonschema = require('jsonschema');

const structSchema = require('./schemes/moleculeSchema');
const rgroupSchema = require('./schemes/rgroupSchema');
const rootSchema = require('./schemes/rootSchema');

const rgroupInstance = {
	rlogic: {
		number: 4,
		resth: true
	},
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

const inst = {
	'mol-1': {
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
			},
			{
				type: 'rg-label',
				location: [3, 3, 3],
				$refs: ['rg-4', 'rg-5']
			}
		],
		bonds: [
			{
				type: 3,
				atoms: [0, 1],
				stereobox: 1
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
	},
	'mol-2': {
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
		]
	},
	'rg-4': rgroupInstance
};

const v = new jsonschema.Validator();
v.addSchema(structSchema, '/Molecule');
v.addSchema(rgroupSchema, '/RGroup');

const res = v.validate(inst, rootSchema);
console.log(res);

