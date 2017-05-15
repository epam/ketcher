import { createStore, applyMiddleware } from 'redux';
import { logger } from 'redux-logger';

import formsState from './reducers/forms-state.es';
import reducers from './reducers/index.es';

export default createStore(reducers, formsState, applyMiddleware(logger));
