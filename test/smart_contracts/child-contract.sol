// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// The following works on linux and macOS. 
// But could not figure out how to make it work on Windows on the GitHub CI. 
//  Tried on the windows docker "simple-contract.sol", ".\\simple-contract.sol" and , ".\simple-contract.sol" but none worked.
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