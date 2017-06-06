import { combineReducers } from 'redux';

import { createNamedFormReducer } from './form';

import analyseReducer from './analyse';
import attachReducer from './template-attach';
import recognizeReducer from './recognize';
import sgroupSpecialReducer from './sdata';
import templatesReducer from './templates';

export default combineReducers({
	analyse: analyseReducer,
	attach: attachReducer,
	'attach-points': createNamedFormReducer('attach-points'),
	atom: createNamedFormReducer('atom'),
	automap: createNamedFormReducer('automap'),
	bond: createNamedFormReducer('bond'),
	check: createNamedFormReducer('check'),
	'label-edit': createNamedFormReducer('label-edit'),
	recognize: recognizeReducer,
	'rgroup-logic': createNamedFormReducer('rgroup-logic'),
	settings: createNamedFormReducer('settings'),
	sgroup: createNamedFormReducer('sgroup'),
	sgroupSpecial: sgroupSpecialReducer,
	templates: templatesReducer
});
