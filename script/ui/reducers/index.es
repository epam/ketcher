import { combineReducers } from 'redux';

import atomReducer from './atom-props-reducer.es';

export default combineReducers({
	atom: atomReducer
});
