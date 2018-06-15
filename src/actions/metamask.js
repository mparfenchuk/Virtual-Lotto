import * as constants from '../constants';

function setMetamaskAccount(results) {
  return {
    type: constants.SET_METAMASK_ACCOUNT,
    payload: results
  }
}

function setMetamaskNetwork(results) {
  return {
    type: constants.SET_METAMASK_NETWORK,
    payload: results
  }
}

function removeMetamaskAccount() {
  return {
    type: constants.REMOVE_METAMASK_ACCOUNT
  }
}

function removeMetamaskNetwork() {
  return {
    type: constants.REMOVE_METAMASK_NETWORK
  }
}

export function setAccount(account) {

    return function(dispatch) {

      if (account === null){
        return dispatch(removeMetamaskAccount());
      } else {
        return dispatch(setMetamaskAccount(account));
      }
    }
}

export function setNetwork(network) {

  return function(dispatch) {

    if (network === null){
      return dispatch(removeMetamaskNetwork());
    } else {
      return dispatch(setMetamaskNetwork(network));
    }
  }
}