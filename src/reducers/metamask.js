import * as constants from '../constants';

const initialState = {  
  account: null,
  network: null
}
  
const metamaskReducer = (state = initialState, action) => {
    if (action.type === constants.SET_METAMASK_ACCOUNT)
    {
      return Object.assign({}, state, {   
        account: action.payload,
        network: state.network

      })
    }

    if (action.type === constants.SET_METAMASK_NETWORK)
    {
      return Object.assign({}, state, {    
        account: state.account,
        network: action.payload
      })
    }

    if (action.type === constants.REMOVE_METAMASK_ACCOUNT)
    {
      return Object.assign({}, state, {   
        account: null,
        network: state.network

      })
    }

    if (action.type === constants.REMOVE_METAMASK_NETWORK)
    {
      return Object.assign({}, state, {    
        account: state.account,
        network: null
      })
    }
  
    return state
  }
  
export default metamaskReducer