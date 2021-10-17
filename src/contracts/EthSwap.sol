// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ThesisToken.sol";

contract EthSwap {
    string public name = "EthSwap for Token";
    ThesisToken public token;
    uint public rate = 100;

    event TokenPurchased(
        address account,
        address token,
        uint amount,
        uint rate
    );

    event TokensSold(
        address account,
        address token,
        uint amount,
        uint rate
    );

    // if variable in constructor -> then it needs to be passed in the migration
    constructor(ThesisToken _token) public {
        token = _token;
    }

    // payable to send ether
    function buyTokens() public payable {
        // redemption rate = # of tokns they receive for 1 ether
        // Amount of Ethereum * Redemption rate
        // Calculate the number of tokens to buy -> msg.value is the amount of ether that is sended
        uint tokenAmount = msg.value * rate;

        // integrate a require -> check if ethSwap balance of Dapp tokens is enough -> this is the address of the ethSwap Contract
        // require ethSwap have enough tokens
        require(
            token.balanceOf(address(this)) >= tokenAmount
        );

        token.transfer(msg.sender, tokenAmount);

        // trigger Event that tokens were purchased
        emit TokenPurchased(msg.sender, address(token), tokenAmount, rate);
    }

    function sellTokens(uint _amount) public {
        // User can't sell more tokens than they have
        require(token.balanceOf(msg.sender) >= _amount);

        // calculate the amount of Ether
        uint etherAmount = _amount / rate;

        // require that EthSwap has enough Ether
        require(address(this).balance >= etherAmount);

        // Perfom sale -> transfer Dapp Tokens back to EthSwap -> again use the address of the contract -> this
        // we can not use the simple transfer function on an ERC-20 Token
        // instead we have to use the transferFrom function -> to allow transfer from an address to EthSwap
        token.transferFrom(msg.sender, address(this), _amount);
        // this will also trigger approve function of the ERC-20 Token -> needs to be called inside a test

        // -> we use transfer for native Ethereum
        payable(msg.sender).transfer(etherAmount);

        // emit an Event
        emit TokensSold(msg.sender, address(token), _amount, rate);
    }
}