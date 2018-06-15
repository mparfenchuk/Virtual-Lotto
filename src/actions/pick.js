import virtual_lotto from '../../build/contracts/VirtualLotto.json'

let contract = require("truffle-contract");

export function pickNumber(web3, number, account, inputBet) {

  return function() {

    let cInstance;
    
    const VirtualLotto = contract(virtual_lotto)
    VirtualLotto.setProvider(web3.currentProvider)

    VirtualLotto.deployed().then((contractInstance) => {
        cInstance = contractInstance	

        return cInstance.pickNumber(number, {from: account, value: web3.toWei(inputBet, 'finney'), gas: 1000000});
    }).catch(function(err) {

        console.log(err.message);
    });

  }

}
