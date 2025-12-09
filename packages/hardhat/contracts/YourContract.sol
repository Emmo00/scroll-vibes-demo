//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

/**
 * A simple voting contract where users can vote on vibes (good or bad)
 * Each user can only vote once
 */
contract VibesVoting {
    // State Variables
    uint256 public goodVotes = 0;
    uint256 public badVotes = 0;
    mapping(address => bool) public hasVoted;

    // Events: a way to emit log statements from smart contract that can be listened to by external parties
    event VotedGood(address indexed voter);
    event VotedBad(address indexed voter);

    /**
     * Function that allows a user to vote for good vibes
     * Each user can only vote once
     */
    function voteGood() public {
        require(!hasVoted[msg.sender], "You have already voted");
        console.log("User %s voted good", msg.sender);

        hasVoted[msg.sender] = true;
        goodVotes += 1;

        emit VotedGood(msg.sender);
    }

    /**
     * Function that allows a user to vote for bad vibes
     * Each user can only vote once
     */
    function voteBad() public {
        require(!hasVoted[msg.sender], "You have already voted");
        console.log("User %s voted bad", msg.sender);

        hasVoted[msg.sender] = true;
        badVotes += 1;

        emit VotedBad(msg.sender);
    }

    /**
     * Function that returns the current vote counts
     */
    function getVotes() public view returns (uint256 good, uint256 bad) {
        return (goodVotes, badVotes);
    }
    receive() external payable {}
}
