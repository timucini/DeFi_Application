// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "./IERC20.sol";


/// @title Thesis Contract
/// @author Timur Burkholz
/// @notice This contract is implemented for a thesis, custom token used in EthSwap contract
/// @custom:experimental This is an experimental contract.
contract ThesisToken is IERC20 {
    string  public name = "Thesis Token";
    string  public symbol = "THES";
    uint256 public _totalSupply = 1000000000000000000000000; // 1 million tokens
    uint8   public decimals = 18;


    // Mapping of balances of addresses, that own tokens
    mapping(address => uint256) public _balanceOf;

    // allowance of a specific use to send his funds
    mapping(address => mapping(address => uint256)) public _allowance;

    constructor() public {
        _balanceOf[msg.sender] = _totalSupply;
    }

    /// @notice here Thesis token will be transfered from sender to receiver
    /// @param _to: payable address of receiver
    /// @param _value: amount of thesis token
    /// @dev triggers Transfer event
    /// @return success (boolean)
    function transfer(address _to, uint256 _value) public override returns (bool success) {
        require(_balanceOf[msg.sender] >= _value);
        _balanceOf[msg.sender] -= _value;
        _balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    /// @notice here a sender approve the transfer of thesis tokens (used for handling in EthSwap)
    /// @param _spender: payable address of receiver
    /// @param _value: amount of thesis token
    /// @dev triggers Approval event#
    /// @return success (boolean)
    function approve(address _spender, uint256 _value) public override returns (bool success) {
        _allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    /// @notice here Thesis token will be transfered from sender to receiver, transfer needs to be approved
    /// @param _from: payable address of sender
    /// @param _to: payable address of receiver
    /// @param _value: amount of thesis token
    /// @dev triggers Transfer event, used in EthSwap
    /// @return success (boolean)
    function transferFrom(address _from, address _to, uint256 _value) public override returns (bool success) {
        require(_value <= _balanceOf[_from]);
        // allowance for sending of thesis tokens is required
        require(_value <= _allowance[_from][msg.sender]);
        _balanceOf[_from] -= _value;
        _balanceOf[_to] += _value;
        _allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }

    function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view virtual override returns (uint256) {
        return _balanceOf[account];
    }

    function allowance(address owner, address spender) public view virtual override returns (uint256) {
        return _allowance[owner][spender];
    }

}