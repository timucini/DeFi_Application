const { assert } = require('chai');

const Token = artifacts.require("ThesisToken");
const EthSwap = artifacts.require("EthSwap");
const { toBN } = web3.utils;

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
        // transfer all tokens to EthSwap contract
        await token.transfer(ethSwap.address, tokens('1000000'))

    })

    describe('ThesisToken deployment', async () => {    
        it('token has a name', async () => {
            const name = await token.name()
            assert.equal(name, 'Thesis Token')
        })
    })

    describe('EthSwap deployment', async () => {
        it('contract has a name', async () => {
            const name = await ethSwap.name()
            assert.equal(name, 'EthSwap for Token')
        })
    })

    describe('transfer tokens to EthSwap Contract', async () => {
        it('contract has tokens', async () => {
            let balance = await token.balanceOf(ethSwap.address)
            assert.equal(balance.toString(), tokens('1000000'))
        })
    })

    describe('EthSwap Contract should no Ether before Investor buys token', async () => {
        it('EthBalance of Contract should be 0', async () => {
             // check the ethereum balance for ethSwap
             let ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
             assert.equal(ethSwapBalance.toString(), tokens('0'))
        })
    })

    describe('Investor buys Thesis tokens', async () => {
        it('valid purchase of tokens from ethSwap for a fixed price', async () => {
            let result = await ethSwap.buyTokens({ from: investor, value: tokens('1')})

            // Check investor token balance after purchase
            let investorBalance = await token.balanceOf(investor)
            assert.equal(investorBalance.toString(), tokens('100'))

            // check ethSwap contract balance after purchase -> should be minus the bought one (Thesis Token)
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

    describe('Investor tries to purchase tokens without sufficient funds', async () => {
        it('buyTokens should be rejected', async () => {
            // no sufficient funds of investor
            await ethSwap.buyTokens({ from: investor, value: tokens('1000')}).should.be.rejected;
        })
    })

    describe('Investor sells tokens without approval', async () => {
        it('sellTokens should be rejected', async () => {
             // Investor tries to sells tokens without approval
            await ethSwap.sellTokens(tokens('100'), { from: investor}).should.be.rejected
        })
    })


    describe('Investor sells tokens with approval', async () => {
        it('investor sells tokens valid', async () => {

            // Initial Blance of investor
            let ethBalanceBeforeSell = toBN(await web3.eth.getBalance(investor))
            //console.log(`Initial: ${ethBalanceBeforeSell.toString()}`);

            // we need to approve the transfer of the tokens before we can sell the Tokens
            // investor must approve tokens before the sell
            let result = await token.approve(ethSwap.address, tokens('100'), { from: investor})
            //console.log(result)

            // Gas used of recipent
            let gasUsedApprove = toBN(result.receipt.gasUsed)
            //console.log(`GasUsed Approve: ${gasUsedApprove}`);
            
            
            // Gas Price for transaction
            let transaction = await web3.eth.getTransaction(result.tx);
            let gasPriceApprove = toBN(transaction.gasPrice);
            //console.log(`GasPriceApprove: ${gasPriceApprove}`);

            // Investor sells tokens
            result = await ethSwap.sellTokens(tokens('100'), { from: investor})
            //console.log(result)

            // Gas used of recipent
            let gasUsedSell = toBN(result.receipt.gasUsed)
            //console.log(`GasUsed Sell: ${gasUsedSell}`);
              
            // Gas Price for transaction
            transaction = await web3.eth.getTransaction(result.tx);
            let gasPriceSell = toBN(transaction.gasPrice);
            //console.log(`GasPriceSell: ${gasPriceSell}`);

            let ethBalanceAfterSell = toBN(await web3.eth.getBalance(investor))

            let combinedBalance = ethBalanceBeforeSell.add(gasUsedApprove).add(gasUsedSell).add(gasPriceApprove).add(gasPriceSell).add(toBN(tokens('1')))
            //console.log(combinedBalance)
            // check eth Balance of investor with gas paid
            assert.equal(
                combinedBalance.toString(), ethBalanceAfterSell.toString()
            )
            


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

        })
    })

    describe('Investor tries to sell tokens without sufficient funds', async () => {
        it('sellTokens should be rejected', async () => {
             // FAILURE: investor can't sell more token than they have
            await ethSwap.sellTokens(tokens('500'), { from: investor}).should.be.rejected;
        })
    })


    describe('Investor stakes Thesis token', async () => {
        it('before issuance', async () => {
        
            // Stake Token with approval (needed)
            // IMPORTANT: Before we can stake the token, the investor must approve eth to be deposited into the EthSwap
            await token.approve(investor, tokens('1'), { from: investor })
            await ethSwap.stakeTokens({ from: investor, value: tokens('1')})
            
            
            // Check staking result after staking
            let result = await token.balanceOf(investor)
            assert.equal(result.toString(), tokens('0'), 'investor thesis token wallet balance correct after staking')

            result = await token.balanceOf(ethSwap.address)
            assert.equal(result.toString(), tokens('1000000'), 'EthSwap Thesis token wallet balance correct before staking')
            
            result = await ethSwap.isStaking(investor)
            assert.equal(result.toString(), 'true', 'investor staking status correct after staking')
        })
    })

    describe('Not owner of smart contract tries to issue tokens', async () => {
        it('issueTokens should be rejected', async () => {
             // Ensure that only onwer can issue tokens
             await ethSwap.issueToken({ from: investor}).should.be.rejected;
        })
    })

    describe('Owner of smart contract tries to issue tokens', async () => {
        it('owner of smart contract can issue tokens', async () => {
             // Ensure that only onwer can issue tokens
             await ethSwap.issueToken({ from: deployer }).should.be.ok;
        })
    })

    
    describe('Staking Thesis tokens after issuance', async () => {  

        it('rewards investors for staking Thesis tokens', async () => {
            // check balances after issuance -> investor should get the issued token after issueToken has been called by the owner of the smart contract
            let result = await token.balanceOf(investor)
            assert.equal(result.toString(), tokens('10'), 'investor Thesis Token wallet balance correct after issuance')

            // check staking balance of investor
            result = await ethSwap.stakingBalance(investor)
            assert.equal(result.toString(), tokens('1'), 'investor staking balance correct after staking')
            
            
        })
    })
    
    describe('Unstaking of Ethereum token', async () => {

        it('valid unstaking', async () => {
            
            let ethBalanceBeforeStaking = toBN(await web3.eth.getBalance(investor))
            let stakingBalance = toBN(await ethSwap.stakingBalance(investor))
            console.log(ethBalanceBeforeStaking.toString())
            console.log(stakingBalance.toString())
             // unstake tokens
            await ethSwap.unstakeTokens({ from: investor, value: tokens('1') })

            let ethBalanceAfterStaking = await web3.eth.getBalance(investor)
            console.log(ethBalanceAfterStaking.toString())
            // check Eth Balance after unstaking
            assert.equal(ethBalanceBeforeStaking.add(stakingBalance).toString(), ethBalanceAfterStaking.toString())
            
            // check results after unstaking of Thesis Token of investor
            let result = await token.balanceOf(investor)
            assert.equal(result.toString(), tokens('10'), 'investor eth balance correct after staking');

            // check results after unstaking of Thesis Token of EthSwap Contract
            result = await token.balanceOf(ethSwap.address)
            assert.equal(result.toString(),tokens('999990'), 'EthSwap Thesis token balance correct after staking')
            
            // check staking balance of investor
            result = await ethSwap.stakingBalance(investor)
            assert.equal(result.toString(), tokens('0'), 'investor staking balance correct after staking')

            // check staking status of investor
            result = await ethSwap.isStaking(investor)
            assert.equal(result.toString(), 'false', 'investor staking status correct after staking')
        })
    })

    describe('Unstaking of Ethereum token with unsufficient funds', async () => {
        it('invalid unstaking should be rejected', async () => {
              // try again unstaking with unsufficient funds
            await ethSwap.unstakeTokens({ from: investor, value: tokens('1') }).should.be.rejected;
        })
    })

})