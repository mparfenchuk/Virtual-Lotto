var HDWalletProvider = require("truffle-hdwallet-provider")
var mnemonic = "accuse spend leave video feature satoshi fence dizzy bench mix emotion guess"

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/cWROvF4DmYYVP2bWfvZO")
      },
      network_id: 4,
	    gas: 3000000
    } 	
  }
};
