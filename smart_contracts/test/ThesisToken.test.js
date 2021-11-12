const { assert } = require('chai');

const Token = artifacts.require("ThesisToken");

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n) {
    return web3.utils.toWei(n, 'ether')
}

contract('ThesisToken', ([deployer, recipient, sender, sender2, recipient2]) => {
    let token

    before(async () => {
        token= await Token.new()
    
    })

    describe('ThesisToken name', async () => {    
        it('token has a name', async () => {
            const name = await token.name()
            assert.equal(name, 'Thesis Token')
        })
    })

    describe('ThesisToken symbol', async () => {    
        it('token has a symbol', async () => {
            const symbol = await token.symbol()
            assert.equal(symbol, 'THES')
        })
    })

    describe('ThesisToken totalSupply', async () => {    
        it('token has a totalSupply', async () => {
            const totalSupply = await token.totalSupply()
            assert.equal(totalSupply, '1000000000000000000000000')
        })
    })

    describe('ThesisToken decimals', async () => {    
        it('token has decimals', async () => {
            const decimals = await token.decimals()
            assert.equal(decimals, 18)
        })
    })

    describe('transfer ThesisToken from smart contract to recipient', async () => {    
        it('recipient should get tokens', async () => {
            let result = await token.transfer(recipient, tokens('10'), {from: deployer})
            let balanceRecipient = await token.balanceOf(recipient)
            assert.equal(balanceRecipient,tokens('10'))

              // check the triggered Event
              const event = result.logs[0].args
              assert.equal(event._from, deployer)
              assert.equal(event._to, recipient)
              assert.equal(event._value.toString(), tokens('10').toString())
        })
    })

    describe('transfer ThesisToken with insufficient funds', async () => {    
        it('should be rejected', async () => {
            await token.transfer(recipient, tokens('1000001'), {from: token.address}).should.be.rejected 
        })
    })



    describe('Sender did not approve token transfer', async () => {
        it('approval for sender should be null', async () => {
            let allowance = await token.allowance(sender,recipient)
            assert.equal('0',allowance.toString())
        })
    })

    describe('Sender approve token transfer', async () => {
        it('increase approval for sender', async () => {
            
            let result = await token.approve(recipient, tokens('100'), { from: sender })

            let allowance = await token.allowance(sender,recipient)
            assert.equal(tokens('100'), allowance.toString())

            // check the triggered Event
            const event = result.logs[0].args
            assert.equal(event._owner, sender)
            assert.equal(event._spender, recipient)
            assert.equal(event._value.toString(), tokens('100').toString())
        })
    })

    
    describe('Transfer from without approval', async () => {
        it('should be rejected', async () => {
            await token.transfer(sender2,tokens('1'))
            await token.transferFrom(sender2,recipient,tokens('1')).should.be.rejected
        })
    })
    
    describe('Transfer from with approval but insufficient funds', async () => {
        it('should be rejected', async () => {
            await token.transfer(sender,tokens('1'))
            await token.approve(sender2, tokens('1'), { from: sender})
            await token.transferFrom(sender, recipient2,tokens('2'), { from: sender2}).should.be.rejected
        })
    })

    describe('Transfer from valid', async () => {
        it('tokens should be transfered to recipient', async () => {
            await token.transfer(sender2,tokens('1'))
            await token.approve(sender, tokens('1'), { from: sender2})
            let result = await token.transferFrom(sender2, recipient2,tokens('1'), { from: sender})

            let balanceRecipient = await token.balanceOf(recipient2)
            assert.equal(balanceRecipient, tokens('1'))

           // check the triggered Event
           const event = result.logs[0].args
           assert.equal(event._from, sender2)
           assert.equal(event._to, recipient2)
           assert.equal(event._value.toString(), tokens('1').toString())
        })
    })
   
})