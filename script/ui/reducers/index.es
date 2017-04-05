import { combineReducers } from 'redux';

import atomReducer from './atom-props-reducer.es';
import attachPointsReducer from './attach-points-reducer.es';
import automapReducer from './automap-reducer.es';
import bondReducer from './bond-reducer.es';
import rgroupLodicReducer from './rgroup-logic-reducer.es';

export default combineReducers({
	'attach-points': attachPointsReducer,
	atom: atomReducer,
	automap: automapReducer,
	bond: bondReducer,
	'rgroup-logic': rgroupLodicReducer
});
