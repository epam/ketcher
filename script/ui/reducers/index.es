import { combineReducers } from 'redux';

import { createNamedFormReducer } from './form-reducer.es';

import analyseReducer from './analyse-reducer.es';
import attachReducer from './attach-reducer.es';
import recognizeReducer from './recognize-reducer.es';
import sgroupSpecialReducer from './sgroup-special-reducer.es';

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
	sgroupSpecial: sgroupSpecialReducer
});
