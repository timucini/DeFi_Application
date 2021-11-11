const EthSwap = artifacts.require('EthSwap')


// script to call the issueTokens function -> script with callback
// call it in console like: truffle exec scripts/issue-token.js
module.exports = async function(callback) {
    let ethSwap = await EthSwap.deployed()
    await ethSwap.issueToken()
    
    // code goes here...
    console.log("Tokkens issued");

    callback()
}