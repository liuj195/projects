import { botReducer } from "./reducers/botReducer";
import { yk1Reducer } from "./reducers/yk1Reducer";
import { tstReducer } from "./reducers/tstReducer";
import { createStore } from "redux";
import { combineReducers } from "redux";

const allReducers = combineReducers({
  botState: botReducer,
  yk1State: yk1Reducer,
  tstState: tstReducer
});
export const store = createStore(
  allReducers,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);
