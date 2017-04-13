import { combineReducers } from 'redux';

import analyseReducer from './analyse-reducer.es';
import atomReducer from './atom-props-reducer.es';
import attachReducer from './attach-reducer.es';
import attachPointsReducer from './attach-points-reducer.es';
import automapReducer from './automap-reducer.es';
import bondReducer from './bond-reducer.es';
import checkReducer from './check-reducer.es';
import labelEditReducer from './label-edit-reducer.es';
import recognizeReducer from './recognize-reducer.es';
import rgroupLodicReducer from './rgroup-logic-reducer.es';
import settingsReducer from './settings-reducer.es';
import sgroupReducer from './sgroup-reducer.es';
import sgroupSpecialReducer from './sgroup-special-reducer.es';

export default combineReducers({
	analyse: analyseReducer,
	attach: attachReducer,
	'attach-points': attachPointsReducer,
	atom: atomReducer,
	automap: automapReducer,
	bond: bondReducer,
	check: checkReducer,
	'label-edit': labelEditReducer,
	recognize: recognizeReducer,
	'rgroup-logic': rgroupLodicReducer,
	settings: settingsReducer,
	sgroup: sgroupReducer,
	sgroupSpecial: sgroupSpecialReducer
});
