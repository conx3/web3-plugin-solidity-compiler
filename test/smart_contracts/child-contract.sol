// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./simple-contract.sol";

contract ChildContract is SimpleContract {
    string public myText;

    constructor(string memory _myText) SimpleContract(1) {
        myText = _myText;
    }

    function setMyText(string memory _myText) public {
        myText = _myText;
    }
}