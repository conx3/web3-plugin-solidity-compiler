// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/** 
 * @title Smart contract task for Con3x company
 * @dev A smart contract in Solidity that saves and reads a message.
 */
contract MessageContract {
    string private message;

    event MessageUpdated(string newMessage);
    //insert message
    function setMessage(string memory _message) public {
        message = _message;
        emit MessageUpdated(_message);
    }
    //get message
    function getMessage() public view returns (string memory) {
        return message;
    }
}