import * as constants from '../constants';
import virtual_lotto from '../../build/contracts/VirtualLotto.json'

let contract = require("truffle-contract");

function setLottoData(results) {
  return {
    type: constants.SET_LOTTO_DATA,
    payload: results
  }
}

export function setLotto(web3) {


  function getTicket(playerWallet, ticket, cInstance, minBet, betsPerRound, roundCount, betCount, bets, web3, dispatch){

    cInstance.playerTickets(playerWallet, ticket).then((result) => {
      let finney = web3.fromWei(result[1].toString(), 'finney');

      bets.push({number:result[0].toString(),wallet:playerWallet,amount:finney + " finney"});
  
      if (betCount === bets.length.toString()){
  
        return dispatch(setLottoData({
          minBet: minBet,
          betsPerRound: betsPerRound,
          betCount: betCount,
          roundCount: roundCount,
          bets: bets
        }));
      }
    
    }).catch(function(err) {
      console.log(err.message);
    });
  
  }

  function getTickets(player, cInstance, minBet, betsPerRound, roundCount, betCount, bets, web3, dispatch) {

    let playerWallet;

    cInstance.players(player).then((result) => {
      playerWallet = result.toString();
  
      return cInstance.getPlayerTicketsAmount(player);
    }).then((result) => {
      for (let i = result.toString()-1; i >= 0 ; i--) {
        getTicket(playerWallet, i, cInstance, minBet, betsPerRound, roundCount, betCount, bets, web3, dispatch);
      }
    }).catch(function(err) {
  
      console.log(err.message);
    });
  
  }

  return function(dispatch) {

    let cInstance;
    let minBet = 0;
    let betsPerRound = 0;
    let roundCount = 0;
    let betCount = 0;
    let bets = [];
    
    const VirtualLotto = contract(virtual_lotto)
    VirtualLotto.setProvider(web3.currentProvider)

    VirtualLotto.deployed().then((contractInstance) => {
      cInstance = contractInstance	

      return cInstance.minBet.call();
    }).then(function(result) {

      minBet = web3.fromWei(result.toString(), 'finney');

      return cInstance.betsPerRound.call()
    }).then(function(result) {
      betsPerRound = result.toString();

      return cInstance.roundCount.call()
    }).then(function(result) {
      roundCount = result.toString();

      return cInstance.betCount.call()
    }).then(function(result) {
      betCount = result.toString();

      return cInstance.getPlayersAmount();
    }).then(function(result) {

      if (result.toString() === '0'){
        return dispatch(setLottoData({
          minBet: minBet,
          betsPerRound: betsPerRound,
          betCount: betCount,
          roundCount: roundCount,
          bets: bets
        }));
      }
      for (let i = result.toString()-1; i >= 0 ; i--) {
        getTickets(i, cInstance, minBet, betsPerRound, roundCount, betCount, bets, web3, dispatch);
      }
    }).catch(function(err) {

      console.log(err.message);
    });

  }

    
}
