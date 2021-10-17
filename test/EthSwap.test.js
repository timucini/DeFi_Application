const { assert } = require('chai');

const Token = artifacts.require("ThesisToken");
const EthSwap = artifacts.require("EthSwap");

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n) {
    return web3.utils.toWei(n, 'ether')
}

contract('EthSwap', ([deployer, investor]) => {
    let token, ethSwap

    before(async () => {
        token= await Token.new()
        ethSwap = await EthSwap.new(token.address)
        // transsfer all tokens to EthSwap
        await token.transfer(ethSwap.address, tokens('1000000'))

        // send tokens to investor
        //await token.transfer(investor, tokens('100'), { from: deployer })
    })

    describe('Token deployment', async () => {
        it('token hat a name', async () => {
            const name = await token.name()
            assert.equal(name, 'Thesis Token')
        })
    })

    describe('EthSwap deployment', async () => {
        it('contract hat a name', async () => {
            const name = await ethSwap.name()
            assert.equal(name, 'EthSwap for Token')
        })

        it('contract has tokens', async () => {
            let balance = await token.balanceOf(ethSwap.address)
            assert.equal(balance.toString(), tokens('1000000'))
        })
    })

    describe('buyTokens()', async () => {
        let result

        before(async () => {
            // Purchase tokens before each example
            result = await ethSwap.buyTokens({ from: investor, value: tokens('1')})
        })
        it('allows user to purcahase tokens from ethSwap for a fixed price', async () => {
            // Check investor token balance after purchase
            let investorBalance = await token.balanceOf(investor)
            assert.equal(investorBalance.toString(), tokens('100'))

            // check ethSwap balance after purchase -> should be minus the bought one (Dapp Token)
            let ethSwapBalance;
            ethSwapBalance = await token.balanceOf(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), tokens('999900'))
            
            // check the ethereum balance for ethSwap
            ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), tokens('1'))

            // check the triggered Event
            const event = result.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokens('100').toString())
            assert.equal(event.rate.toString(), '100')
        })
    })

    describe('selTokens()', async () => {
        let result

        before(async () => {
            // we need to approve the transfer of the tokens before we can sell the Tokens
            // investor must approve tokens before the sell
            await token.approve(ethSwap.address, tokens('100'), { from: investor})
            // Investor sells tokens
            result = await ethSwap.sellTokens(tokens('100'), { from: investor})
        })
        it('allows user to sell tokens from ethSwap for a fixed price', async () => {
            // Check investor token balance after sell
            let investorBalance = await token.balanceOf(investor)
            assert.equal(investorBalance.toString(), tokens('0'))

            // check ethSwap balance after sell -> should be pluss the sold one (Dapp Token)
            let ethSwapBalance;
            ethSwapBalance = await token.balanceOf(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), tokens('1000000'))
            
            // check the ethereum balance for ethSwap
            ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), tokens('0'))

            // check the triggered Event
            const event = result.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokens('100').toString())
            assert.equal(event.rate.toString(), '100')

            // FAILURE: investor can't sell more token than they have
            await ethSwap.sellTokens(tokens('500'), { from: investor}).should.be.rejected;
        })
    })
    
    describe('Farming tokens', async () => {
        let result;
        

        it('rewards investors for staking mDai tokens', async () => {

            // Check investor balance before staking -> 100 daiToken
            result = await token.balanceOf(investor)
            console.log(result.toString())
            // result of 100 tokens should be correct before the staking
            /*assert.equal(result.toString(), tokens('100'), 'investor Mock Dai wallet balance correct before staking')


            // Stake Token with approval (needed)

            // IMPORTANT: Before we can stake the token, the investor must approve eth to be deposited into the tokenFarm
            */
            await token.approve(investor, tokens('10'), { from: investor })
            await ethSwap.stakeTokens(tokens('10'), { from: investor } )
            /*
            // Stake Mock DAI Token
            await ethSwap.stakeTokens(tokens('10'), { from: investor } )

            // Check staking result after staking
            result = await token.balanceOf(investor)
            //assert.equal(result.toString(), tokens('0'), 'investor Mock Dai wallet balance correct after staking')

            result = await token.balanceOf(ethSwap.address)
            assert.equal(result.toString(), tokens('10'), 'Token Farm Mock Dai wallet balance correct after staking')
            /*
            result = await ethSwap.isStaking(investor)
            assert.equal(result.toString(), 'true', 'investor staking status correct after staking')


            // Issue tokens
            await ethSwap.issueToken({ from: deployer }) 

            // check balances after issuance -> investor should get the issued token after issueToken has been called by the owner of the smart contract
            result = await token.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor DApp Token wallet balance correct after issuance')

            // Ensure that only onwer can issue tokens
            await ethSwap.issueToken({ from: investor}).should.be.rejected;

            // unstake tokens
            await ethSwap.unstakeTokens({ from: investor})

            // check results after unstaking of Dai Token of investor
            result = await token.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor Mock Dai Token balance correct after staking');

            // check results after unstaking of Dai Token of tokenFarm
            result = await token.balanceOf(ethSwap.address)
            assert.equal(result.toString(),tokens('0'), 'TokenFarm Mock Dai baalance correct after staking')

            // check staking balance of investor
            result = await token.stakingBalance(investor)
            assert.equal(result.toString(), tokens('0'), 'investor staking balance correct after staking')

            // check staking status of investor
            result = await ethSwap.isStaking(investor)
            assert.equal(result.toString(), 'false', 'investor staking status correct after staking')
            */
        })
    })
    
})