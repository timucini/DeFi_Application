const { assert } = require('chai');

const Token = artifacts.require("ThesisToken");
const ThesisSwap = artifacts.require("ThesisSwap");
const { toBN } = web3.utils;

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n) {
    return web3.utils.toWei(n, 'ether')
}

contract('ThesisSwap', ([deployer, investor]) => {
    let token, thesisSwap

    before(async () => {
        token= await Token.new()
        thesisSwap = await ThesisSwap.new(token.address)
        // transfer all tokens to thesisSwap contract
        await token.transfer(thesisSwap.address, tokens('1000000'))

    })

    describe('ThesisToken deployment', async () => {    
        it('token has a name', async () => {
            // Arrange 
            let thesisName = 'Thesis Token';

            // Act
            const name = await token.name()
            
            // Assert
            assert.equal(name, thesisName)
        })
    })

    describe('ThesisSwap deployment', async () => {
        it('contract has a name', async () => {
            // Arrange
            let thesisSwapName = 'ThesisSwap for Thesis Token'

            // Act
            const name = await thesisSwap.name()

            // Assert
            assert.equal(name, thesisSwapName)
        })
    })

    describe('transfer tokens to ThesisSwap Contract', async () => {
        it('contract has tokens', async () => {
            // Arrange
            let tokenAmount = tokens('1000000')

            // Act
            let balance = await token.balanceOf(thesisSwap.address)

            // Assert
            assert.equal(balance.toString(), tokenAmount)
        })
    })

    describe('ThesisSwap Contract should no Ether before Investor buys token', async () => {
        it('EthBalance of Contract should be 0', async () => {
            // Arrange
            let amount = tokens('0')
            
            // Act
            // check the ethereum balance for ThesisSwap
            let thesisSwapBalance = await web3.eth.getBalance(thesisSwap.address)
            
            // Assert
            assert.equal(thesisSwapBalance.toString(), amount)
        })
    })

    describe('Investor buys Thesis tokens', async () => {
        it('valid purchase of tokens from ThesisSwap for a fixed price', async () => {
            let result = await thesisSwap.buyTokens({ from: investor, value: tokens('1')})

            // Check investor token balance after purchase
            let investorBalance = await token.balanceOf(investor)
            assert.equal(investorBalance.toString(), tokens('100'))

            // check ThesisSwap contract balance after purchase -> should be minus the bought one (Thesis Token)
            let thesisSwapBalance;
            thesisSwapBalance = await token.balanceOf(thesisSwap.address)
            assert.equal(thesisSwapBalance.toString(), tokens('999900'))
            
            // check the ethereum balance for thesisSwap
            thesisSwapBalance = await web3.eth.getBalance(thesisSwap.address)
            assert.equal(thesisSwapBalance.toString(), tokens('1'))

            // check the triggered Event
            const event = result.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokens('100').toString())
            assert.equal(event.rate.toString(), '100')
        })
    })

    describe('Investor tries to purchase tokens without sufficient funds', async () => {
        it('buyTokens should be rejected', async () => {
            // no sufficient funds of investor
            await thesisSwap.buyTokens({ from: investor, value: tokens('1000')}).should.be.rejected;
        })
    })

    describe('Investor sells tokens without approval', async () => {
        it('sellTokens should be rejected', async () => {
             // Investor tries to sells tokens without approval
            await thesisSwap.sellTokens(tokens('100'), { from: investor}).should.be.rejected
        })
    })


    describe('Investor sells tokens with approval', async () => {
        it('investor sells tokens valid', async () => {

            // we need to approve the transfer of the tokens before we can sell the Tokens
            // investor must approve tokens before the sell
            let result = await token.approve(thesisSwap.address, tokens('100'), { from: investor})
            //console.log(result)   

            // Investor sells tokens
            result = await thesisSwap.sellTokens(tokens('100'), { from: investor})
            //console.log(result)    
            
             // Check investor token balance after sell
            let investorBalance = await token.balanceOf(investor)
            assert.equal(investorBalance.toString(), tokens('0'))

            // check thesisSwap balance after sell -> should be pluss the sold one (Dapp Token)
            let thesisSwapBalance;
            thesisSwapBalance = await token.balanceOf(thesisSwap.address)
            assert.equal(thesisSwapBalance.toString(), tokens('1000000'))
            
            // check the ethereum balance for ThesisSwap
            thesisSwapBalance = await web3.eth.getBalance(thesisSwap.address)
            assert.equal(thesisSwapBalance.toString(), tokens('0'))

            // check the triggered Event
            const event = result.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokens('100').toString())
            assert.equal(event.rate.toString(), '100')

        })
    })

    describe('Investor tries to sell tokens without sufficient funds', async () => {
        it('sellTokens should be rejected', async () => {
             // FAILURE: investor can't sell more token than they have
            await thesisSwap.sellTokens(tokens('500'), { from: investor}).should.be.rejected;
        })
    })


    describe('Investor stakes Thesis token', async () => {
        it('before issuance', async () => {
        
            // Stake Token with approval (needed)
            // IMPORTANT: Before we can stake the token, the investor must approve eth to be deposited into the thesisSwap
            await token.approve(investor, tokens('10'), { from: investor })
            let result = await thesisSwap.stakeTokens({ from: investor, value: tokens('10')})
            
            // check the triggered Event
            const event = result.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.ethAmount.toString(), tokens('10').toString())
            
            
            // Check staking result after staking
            result = await token.balanceOf(investor)
            assert.equal(result.toString(), tokens('0'), 'investor thesis token wallet balance correct after staking')

            result = await token.balanceOf(thesisSwap.address)
            assert.equal(result.toString(), tokens('1000000'), 'thesisSwap Thesis token wallet balance correct before staking')
            
            result = await thesisSwap.isStaking(investor)
            assert.equal(result.toString(), 'true', 'investor staking status correct after staking')
        })
    })

    describe('Not owner of smart contract tries to issue tokens', async () => {
        it('issueTokens should be rejected', async () => {
             // Ensure that only onwer can issue tokens
             await thesisSwap.issueToken({ from: investor}).should.be.rejected;
        })
    })

    describe('Owner of smart contract tries to issue tokens', async () => {
        it('owner of smart contract can issue tokens', async () => {
             // Ensure that only onwer can issue tokens
             await thesisSwap.issueToken({ from: deployer }).should.be.ok;
        })
    })

    
    describe('Staking Thesis tokens after issuance', async () => {  

        it('rewards investors for staking Thesis tokens', async () => {
            // check balances after issuance -> investor should get the issued token after issueToken has been called by the owner of the smart contract
            let result = await token.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor Thesis Token wallet balance correct after issuance')

            // check staking balance of investor
            result = await thesisSwap.stakingBalance(investor)
            assert.equal(result.toString(), tokens('10'), 'investor staking balance correct after staking')
            
            
        })
    })
    
    describe('Unstaking of Ethereum token', async () => {

        it('valid unstaking', async () => {
            
            let ethBalanceBeforeStaking = toBN(await web3.eth.getBalance(investor))
            let stakingBalance = toBN(await thesisSwap.stakingBalance(investor))
            console.log(ethBalanceBeforeStaking.toString())
            console.log(stakingBalance.toString())
             // unstake tokens
            let result = await thesisSwap.unstakeTokens(investor, tokens('10'))

            // check the triggered Event
            const event = result.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.ethAmount.toString(), tokens('10').toString())

            let ethBalanceAfterStaking = await web3.eth.getBalance(investor)
            console.log(ethBalanceAfterStaking.toString())
            // check Eth Balance after unstaking
            assert.equal(ethBalanceBeforeStaking.add(toBN(tokens('10'))).toString(), ethBalanceAfterStaking.toString())
            
            // check results after unstaking of Thesis Token of investor
            result = await token.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor eth balance correct after staking');

            // check results after unstaking of Thesis Token of thesisSwap Contract
            result = await token.balanceOf(thesisSwap.address)
            assert.equal(result.toString(),tokens('999900'), 'thesisSwap Thesis token balance correct after staking')
            
            // check staking balance of investor
            result = await thesisSwap.stakingBalance(investor)
            assert.equal(result.toString(), tokens('0'), 'investor staking balance correct after staking')

            // check staking status of investor
            result = await thesisSwap.isStaking(investor)
            assert.equal(result.toString(), 'false', 'investor staking status correct after staking')
        })
    })

    describe('Unstaking of Ethereum token with unsufficient funds', async () => {
        it('invalid unstaking should be rejected', async () => {
              // try again unstaking with unsufficient funds
            await thesisSwap.unstakeTokens(investor, { value: tokens('1')}).should.be.rejected;
        })
    })

})