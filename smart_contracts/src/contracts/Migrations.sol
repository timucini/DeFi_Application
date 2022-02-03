// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

/// @title Migrations Contract
/// @author Timur Burkholz
/// @notice This contract is implemented for a thesis, migrate Thesis Token and ThesisSwap Contract on Blockchain
/// @custom:experimental This is an experimental contract.
contract Migrations {
  address public owner = msg.sender;
  uint public last_completed_migration;

  modifier restricted() {
    require(
      msg.sender == owner,
      "This function is restricted to the contract's owner"
    );
    _;
  }

  function setCompleted(uint completed) public restricted {
    last_completed_migration = completed;
  }
}
