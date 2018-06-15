import { combineReducers } from 'redux'
import metamaskReducer from './reducers/metamask'
import lottoReducer from './reducers/lotto'

const reducer = combineReducers({
  metamask: metamaskReducer,
  lotto: lottoReducer
})

export default reducer