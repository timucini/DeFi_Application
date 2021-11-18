// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

import "./ThesisToken.sol";

contract EthSwap {
    string public name = "EthSwap for Token";
    ThesisToken public token;
    uint public rate = 100;
    uint public stakingRate = 10;

    address public owner;

    // address of staking addresses;
    address[] public stakers;

    // the stalking balance for a specific User
    mapping(address => uint) public stakingBalance;

    // check if the address has Staked
    mapping(address => bool) public hasStaked;

    mapping(address => bool) public isStaking;

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
        owner = msg.sender;
    }

    // payable to send ether
    function buyTokens() public payable {
        // redemption rate = # of tokens they receive for 1 ether
        // Amount of Ethereum * Redemption rate
        // Calculate the number of tokens to buy -> msg.value is the amount of ether that is sended
        uint tokenAmount = msg.value * rate;

        // integrate a require -> check if ethSwap balance of thesis tokens is enough -> this is the address of the ethSwap Contract
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

        // Perfom sale -> transfer Thesis Tokens back to EthSwap -> again use the address of the contract -> this
        // we can not use the simple transfer function on an ERC-20 Token
        // instead we have to use the transferFrom function -> to allow transfer from an address to EthSwap
        token.transferFrom(msg.sender, address(this), _amount);
        // this will also trigger approve function of the ERC-20 Token -> needs to be called inside a test

        // -> we use transfer for native Ethereum
        payable(msg.sender).transfer(etherAmount);

        // emit an Event
        emit TokensSold(msg.sender, address(token), _amount, rate);
    }

    // 1. Stakes Tokens (Deposit)
    function stakeTokens() payable public {
        // require amount to stake is greater than 0 
        require(msg.value > 0, "amount cannot be 0");

        //msg.sender.approve(msg.sender, msg.value);
        // Transfer eth to this (tokenfarm) contract for staking
        payable(owner).transfer(msg.value);

        // Update staking balance
        stakingBalance[msg.sender] =  stakingBalance[msg.sender] + msg.value;

        // Add user to stakers array if they haven't staked already
        if(!hasStaked[msg.sender]) {
            // the stakers array should only contain addresses once
            stakers.push(msg.sender);
        }

        // update staking status
        hasStaked[msg.sender] = true;
        isStaking[msg.sender] = true;
    }
    // 2. Issuing Tokens -> reward (triggered only by owner)
    function issueToken() public {
        // this functions should only be triggered by the owner of the smart contract
        require(msg.sender == owner, "caller must be owner");

        // loop through stakers array
        for(uint i=0; i < stakers.length; i++) {
            address recipient = stakers[i];
            // for each staker get the balance of the staked thesis Tokens -> stakingBalance
            uint balance =  stakingBalance[recipient];
            if(balance > 0 ) {
                // send them the same amount of thesis Tokens
            uint amount = balance * stakingRate;
            token.transfer(recipient, amount);
            }
        }
    }

    // 3. Unstaking Tokens (Withdraw) -> allow investor to remove tokens from the application -> from the tokaneFarm
    function unstakeTokens(address payable _to) public payable {
        // Fetch staking balance
        //uint balance = stakingBalance[msg.sender]; // here ERROR? Maybe 0?
        //uint balance = 1000000000000000000;
        // require amount greater than 0
        uint balance = stakingBalance[_to];
        require(balance >= msg.value , "Cannot unstake more eth than staked");

        // transfer eth to this contract for staking
        //payable(msg.sender).transfer(unstakeAmount);

        (bool succeed, bytes memory data) = _to.call{value: msg.value}("");
        require(succeed, "Failed to withdraw Ether");

        // reset the staking balance
        stakingBalance[_to] = balance - msg.value;

        if(stakingBalance[_to] == 0) {
            // update staking status
            isStaking[_to] = false;
        } 
    }
}