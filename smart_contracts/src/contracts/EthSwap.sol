// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

import "./ThesisToken.sol";

/// @title Ethwap Contract
/// @author Timur Burkholz
/// @notice This contract is implemented for a thesis, used for trading Thesis Token and Staking
/// @custom:experimental This is an experimental contract.
contract EthSwap {
    string public name = "EthSwap for Token";
    ThesisToken public token;
    uint256 public rate = 100;
    uint256 public stakingRate = 10;

    address public owner;

    // address of staking addresses
    address[] public stakers;

    // the stalking balance for a specific User
    mapping(address => uint256) public stakingBalance;

    // check if the address has Staked
    mapping(address => bool) public hasStaked;

    mapping(address => bool) public isStaking;

    // Event submitted when Token bought
    event TokenPurchased(
        address account,
        address token,
        uint256 amount,
        uint256 rate
    );

    // Event submitted when Token sold
    event TokensSold(
        address account,
        address token,
        uint256 amount,
        uint256 rate
    );

    // Event when Staking desposit
    event TokenStaked(address account, address token, uint256 ethAmount);

    // Event when Stkaing payed out
    event TokenUnstaked(address account, address token, uint256 ethAmount);

    
    constructor(ThesisToken _token) public {
        token = _token;
        owner = msg.sender;
    }

    /// @notice Here ThesisToken is paid with Ether for a specific rate
    /// @dev triggers TokenPurchased event
    function buyTokens() public payable {
        // redemption rate = # of tokens they receive for 1 ether
        // Amount of Ethereum * Redemption rate
        // Calculate the number of tokens to buy -> msg.value is the amount of ether that is sended
        uint256 tokenAmount = msg.value * rate;

        // integrate a require -> check if ethSwap balance of thesis tokens is enough -> this is the address of the ethSwap Contract
        // require ethSwap have enough tokens
        require(token.balanceOf(address(this)) >= tokenAmount);

        token.transfer(msg.sender, tokenAmount);

        // trigger Event that tokens were purchased
        emit TokenPurchased(msg.sender, address(token), tokenAmount, rate);
    }

    /// @notice here ThesisToken is sold for Ether for a specific rate
    /// @param _amount: Amount of ether sent from user
    /// @dev triggers TokenSold event
    function sellTokens(uint256 _amount) public {
        // User can't sell more tokens than they have
        require(token.balanceOf(msg.sender) >= _amount);

        // calculate the amount of Ether
        uint256 etherAmount = _amount / rate;

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

    /// @notice here Ether is staked, Staking balance of investor will be saved
    /// @dev triggers TokenStaked event
    function stakeTokens() public payable {
        // require amount to stake is greater than 0
        require(msg.value > 0, "amount cannot be 0");

        // update staking balance
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + msg.value;

        // add user to stakers array if they haven't staked already
        if (!hasStaked[msg.sender]) {
            // the stakers array should only contain addresses once
            stakers.push(msg.sender);
        }

        // update staking status
        hasStaked[msg.sender] = true;
        isStaking[msg.sender] = true;
        emit TokenStaked(msg.sender, address(token), msg.value);
    }

    /// @notice here Thesis tokens are issued. Investor will get their reward
    /// @dev can only be called from contract owner
    function issueToken() public {
        // this functions should only be triggered by the owner of the smart contract
        require(msg.sender == owner, "caller must be owner");

        // loop through stakers array
        for (uint256 i = 0; i < stakers.length; i++) {
            address recipient = stakers[i];
            // for each staker get the balance of the staked thesis Tokens -> stakingBalance
            uint256 balance = stakingBalance[recipient];
            if (balance > 0) {
                // send them the same amount of thesis Tokens
                uint256 amount = balance * stakingRate;
                token.transfer(recipient, amount);
            }
        }
    }

    /// @notice here Ether is unstaked, investor will receive his invested ether
    /// @param _to: payable address of investor
    /// @param _amount: requested ether that investor wants to receive back
    /// @dev triggers TokenUnstaked event
    function unstakeTokens(address payable _to, uint256 _amount) public {
        
        // require amount greater than 0
        uint256 balance = stakingBalance[_to];
        require(balance >= _amount, "Cannot unstake more eth than staked");

        // require that EthSwap has enough Ether
        require(address(this).balance >= _amount);

        // transfer eth to this contract for staking
        (bool succeed, bytes memory data) = _to.call{value: _amount}("");
        require(succeed, "Failed to withdraw Ether");

        // reset the staking balance
        stakingBalance[_to] = balance - _amount;

        if (stakingBalance[_to] == 0) {
            // update staking status
            isStaking[_to] = false;
        }

        emit TokenUnstaked(_to, address(token), _amount);
    }
}
