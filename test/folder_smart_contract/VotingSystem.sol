// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Voting System Contract
/// @author Houssine Agha
/// @notice This contract allows users to vote for candidates

contract VotingSystem {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    mapping(uint => Candidate) private candidates;
    mapping(address => bool) public voters;

    uint private candidatesCount;
    event Voted(uint indexed candidateId);

    //Appoint candidates before contract is published
    constructor(string[] memory _candidateNames) {
        for (uint i = 0; i < _candidateNames.length; i++) {
            candidates[candidatesCount] = Candidate(
                candidatesCount,
                _candidateNames[i],
                0
            );
            candidatesCount++;
        }
    }

    function vote(uint _candidateId) public {
        require(!voters[msg.sender], "You have already voted.");
        require(_candidateId < candidatesCount, "Invalid candidate ID.");

        voters[msg.sender] = true;
        candidates[_candidateId].voteCount++;

        emit Voted(_candidateId);
    }

    function getCandidatesCount() public view returns (uint) {
        return candidatesCount;
    }

    function getCandidate(
        uint _candidateId
    ) public view returns (Candidate memory) {
        require(_candidateId < candidatesCount, "Invalid candidate ID.");
        return candidates[_candidateId];
    }

    // Appoint candidates after contract is published
    function addCandidates(string[] memory _candidateNames) external {
        for (uint i = 0; i < _candidateNames.length; i++) {
            candidates[candidatesCount] = Candidate(
                candidatesCount,
                _candidateNames[i],
                0
            );
            candidatesCount++;
        }
    }
}
