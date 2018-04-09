const collection = {
	title: 'Collection',
	type: 'object',
	required: ['name'],
	properties: {
		name: {
			title: 'Name',
			type: "string"
		},
		subname: {
			title: "Subname",
			type: "string"
		},
		atoms: {
			title: 'Atoms',
			type: 'array',
			items: {
				type: 'integer'
			}
		},
		bonds: {
			title: 'Bonds',
			type: 'array',
			items: {
				type: 'integer'
			}
		},
		sgroups: {
			title: 'Sgroups',
			type: 'array',
			items: {
				type: 'integer'
			}
		},
		obj3ds: {
			title: 'Obj3ds',
			type: 'array',
			items: {
				type: 'integer'
			}
		},
		members: {
			title: 'Members',
			type: 'array',
			items: {
				type: 'integer'
			}
		},
		rgroups: {
			title: 'Rgroups',
			type: 'array',
			items: {
				type: 'integer'
			}
		}
	}
};

const sgroup = {
	title: "SGroup",
	type: "object",
	required: ["type"],
	oneOf: [
		{
			key: 'GEN',
			title: "Generic",
			properties: {
				type: { enum: ['GEN'] }
			}
		},
		{
			key: 'MUL',
			title: "Multiple group",
			type: "object",
			properties: {
				type: { enum: ["MUL"] },
				mul: {
					title: "Repeat count",
					type: "integer",
					default: 1,
					minimum: 1,
					maximum: 1000
				}
			},
			required: ["mul"]
		},
		{
			key: 'SRU',
			title: "SRU polymer",
			properties: {
				type: { enum: ["SRU"] },
				subscript: {
					title: "Polymer label",
					type: "string",
					default: "n",
					pattern: "^[a-zA-Z]$",
					invalidMessage: "SRU subscript should consist of a single letter"
				},
				connectivity: {
					title: 'Repeat Pattern',
					enum: ['HT', 'HH', 'EU'],
					enumNames: [
						'Head-to-tail',
						'Head-to-head',
						'Either unknown'
					],
					default: "ht"
				}
			},
			required: ["subscript", "connectivity"]
		},
		{
			key: 'SUP',
			title: 'Superatom',
			properties: {
				type: { enum: ["SUP"] },
				name: {
					title: "Name",
					type: "string",
					default: "",
					minLength: 1,
					invalidMessage: "Please, provide a name for the superatom"
				}
			}
		}
	]
};

const rgroup = {
	title: "R-Group",
	type: "object",
	properties: {
		range: {
			title: "Occurrence",
			type: "string",
			maxLength: 50
		},
		resth: {
			title: "RestH",
			type: "boolean"
		},
		ifthen: {
			title: "Condition",
			type: "integer",
			minium: 0
		}
	}
};
