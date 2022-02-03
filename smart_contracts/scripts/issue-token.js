const ThesisSwap = artifacts.require('ThesisSwap')


// script to call the issueTokens function -> script with callback
// call it in console like: truffle exec scripts/issue-token.js
module.exports = async function(callback) {
    let thesisSwap = await ThesisSwap.deployed()
    await thesisSwap.issueToken()
    
    // code goes here...
    console.log("Tokkens issued");

    callback()
}