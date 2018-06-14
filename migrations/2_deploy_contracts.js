const VirtualLotto = artifacts.require("./VirtualLotto.sol");

module.exports = function(deployer, network, accounts) {

    return deployer
        .then(() => {
            return deployer.deploy(VirtualLotto, 1, 5);
        });
       
}