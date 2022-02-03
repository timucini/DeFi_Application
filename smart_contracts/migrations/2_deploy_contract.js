const ThesisToken = artifacts.require("ThesisToken");
const ThesisSwap = artifacts.require("ThesisSwap");

module.exports = async function (deployer, network, accounts) {
    // deploy Token
    await deployer.deploy(ThesisToken);
    const token = await ThesisToken.deployed()

    // deploy ThesisSwap -> we have to pass token address for the constructor
    await deployer.deploy(ThesisSwap, token.address);
    const thesisSwap = await ThesisSwap.deployed()

    // Transfer all tokens to ThesisSwap(1 Million)
    await token.transfer(thesisSwap.address, '1000000000000000000000000')
    
};
