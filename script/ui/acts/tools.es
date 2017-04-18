const editorActions = {
	"select-lasso": {
		"title": "Lasso Selection",
		action: { tool: 'select', opts: 'lasso' }
	},
	"select-rectangle": {
		"title": "Rectangle Selection",
		action: { tool: 'select', opts: 'lasso' }
	},
	"select-fragment": {
		"title": "Fragment Selection",
		action: { tool: 'select', opts: 'fragment' }
	},
	"erase": {
		"title": "Erase",
		action: { tool: 'eraser', opts: 1 } // TODO last selector mode is better
	}

};

export default editorActions;
