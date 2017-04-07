import { combineReducers } from 'redux';

import atomReducer from './atom-props-reducer.es';
import attachPointsReducer from './attach-points-reducer.es';
import automapReducer from './automap-reducer.es';
import bondReducer from './bond-reducer.es';
import checkReducer from './check-reducer.es';
import rgroupLodicReducer from './rgroup-logic-reducer.es';
import settingsReducer from './settings-reducer.es';
import sgroupReducer from './sgroup-reducer.es';

export default combineReducers({
	'attach-points': attachPointsReducer,
	atom: atomReducer,
	automap: automapReducer,
	bond: bondReducer,
	check: checkReducer,
	'rgroup-logic': rgroupLodicReducer,
	settings: settingsReducer,
	sgroup: sgroupReducer
});
