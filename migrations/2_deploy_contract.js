const ThesisToken = artifacts.require("ThesisToken");
const EthSwap = artifacts.require("EthSwap");

module.exports = async function (deployer, network, accounts) {
    // deploy Token
    await deployer.deploy(ThesisToken);
    const token = await ThesisToken.deployed()

    // deploy EthSwap -> we have to pass token address for the constructor
    await deployer.deploy(EthSwap, token.address);
    const ethSwap = await EthSwap.deployed()

    // Transfer all tokens to EthSwap(1 Million)
    await token.transfer(ethSwap.address, '1000000000000000000000000')
    
};
