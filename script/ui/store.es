import { createStore, applyMiddleware } from 'redux';
import { logger } from 'redux-logger';
import reducer from './reducers/index.es';

export default createStore(reducer, {}, applyMiddleware(logger));
