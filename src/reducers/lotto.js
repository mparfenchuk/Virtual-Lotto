import * as constants from '../constants';

const initialState = {  
  minBet: 0,
  betsPerRound: 0,
  betCount: 0,
  roundCount: 0,
  bets: []
}
  
const lottoReducer = (state = initialState, action) => {
    if (action.type === constants.SET_LOTTO_DATA)
    {
      return Object.assign({}, state, {   
        minBet: action.payload.minBet,
        betsPerRound: action.payload.betsPerRound,
        betCount: action.payload.betCount,
        roundCount: action.payload.roundCount,
        bets: action.payload.bets
      })
    }

    if (action.type === constants.REMOVE_LOTTO_DATA)
    {
      return Object.assign({}, state, {   
        minBet: 0,
        betsPerRound: 0,
        betCount: 0,
        roundCount: 0,
        bets: []

      })
    }
  
    return state
  }
  
export default lottoReducer