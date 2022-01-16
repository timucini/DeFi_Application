// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

/// @title Thesis Contract
/// @author Timur Burkholz
/// @notice This contract is implemented for a thesis, custom token used in EthSwap contract
/// @custom:experimental This is an experimental contract.
contract ThesisToken {
    string  public name = "Thesis Token";
    string  public symbol = "THES";
    uint256 public totalSupply = 1000000000000000000000000; // 1 million tokens
    uint8   public decimals = 18;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    // Mapping of balances of addresses, that own tokens
    mapping(address => uint256) public balanceOf;

    // allowance of a specific use to send his funds
    mapping(address => mapping(address => uint256)) public allowance;

    constructor() public {
        balanceOf[msg.sender] = totalSupply;
    }

    /// @notice here Thesis token will be transfered from sender to receiver
    /// @param _to: payable address of receiver
    /// @param _value: amount of thesis token
    /// @dev triggers Transfer event
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value);
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    /// @notice here a sender approve the transfer of thesis tokens (used for handling in EthSwap)
    /// @param _spender: payable address of receiver
    /// @param _value: amount of thesis token
    /// @dev triggers Approval event
    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    /// @notice here Thesis token will be transfered from sender to receiver, transfer needs to be approved
    /// @param _from: payable address of sender
    /// @param _to: payable address of receiver
    /// @param _value: amount of thesis token
    /// @dev triggers Transfer event, used in EthSwap
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_value <= balanceOf[_from]);
        // allowance for sending of thesis tokens is required
        require(_value <= allowance[_from][msg.sender]);
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }
}