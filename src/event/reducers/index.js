import { combineReducers } from 'redux';

import sessionsReducer from './sessions/';
import activitiesReducer from './activities/';

export default combineReducers({
  sessionsReducer,
  activitiesReducer,
});
