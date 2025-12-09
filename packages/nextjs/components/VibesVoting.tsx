"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export const VibesVoting = () => {
  const { address: connectedAddress } = useAccount();
  const [hasVoted, setHasVoted] = useState(false);

  // Read the current vote counts
  const {
    data: votes,
    isLoading: isLoadingVotes,
    refetch: refetchVotes,
  } = useScaffoldReadContract({
    contractName: "VibesVoting",
    functionName: "getVotes",
  });

  // Check if user has already voted
  const { data: userHasVoted } = useScaffoldReadContract({
    contractName: "VibesVoting",
    functionName: "hasVoted",
    args: [connectedAddress],
  });

  // Setup write functions for voting
  const { writeContractAsync: writeVoteGood, isMining: isMiningGood } = useScaffoldWriteContract("VibesVoting");
  const { writeContractAsync: writeVoteBad, isMining: isMiningBad } = useScaffoldWriteContract("VibesVoting");

  // Update hasVoted state when contract data changes
  useEffect(() => {
    setHasVoted(userHasVoted || false);
  }, [userHasVoted]);

  const handleVoteGood = async () => {
    try {
      await writeVoteGood(
        {
          functionName: "voteGood",
        },
        {
          onBlockConfirmation: async () => {
            notification.success("✨ You voted for good vibes!");
            setHasVoted(true);
            await refetchVotes();
          },
        },
      );
    } catch (error) {
      console.error("Error voting good:", error);
      notification.error("Failed to vote good vibes");
    }
  };

  const handleVoteBad = async () => {
    try {
      await writeVoteBad(
        {
          functionName: "voteBad",
        },
        {
          onBlockConfirmation: async () => {
            notification.success("💔 You voted for bad vibes!");
            setHasVoted(true);
            await refetchVotes();
          },
        },
      );
    } catch (error) {
      console.error("Error voting bad:", error);
      notification.error("Failed to vote bad vibes");
    }
  };

  const goodVoteCount = votes ? Number(votes[0]) : 0;
  const badVoteCount = votes ? Number(votes[1]) : 0;
  const totalVotes = goodVoteCount + badVoteCount;
  const goodPercentage = totalVotes > 0 ? Math.round((goodVoteCount / totalVotes) * 100) : 0;
  const badPercentage = totalVotes > 0 ? Math.round((badVoteCount / totalVotes) * 100) : 0;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-base-200 to-base-300">
      <div className="card w-full max-w-2xl shadow-2xl bg-base-100">
        <div className="card-body items-center text-center gap-8">
          {/* Title */}
          <h1 className="card-title text-4xl md:text-5xl">
            What are your <span className="text-primary">vibes</span>?
          </h1>

          {/* Subtitle */}
          {!connectedAddress ? (
            <p className="text-xl text-warning">Please connect your wallet to vote</p>
          ) : hasVoted ? (
            <p className="text-xl text-success font-bold">✓ You have already voted!</p>
          ) : (
            <p className="text-lg">Share your current mood with the community</p>
          )}

          {/* Vote Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {/* Good Vibes Button */}
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={handleVoteGood}
                disabled={!connectedAddress || hasVoted || isMiningGood}
                className="btn btn-lg btn-success text-white w-full disabled:opacity-50 disabled:cursor-not-allowed hover:btn-success-focus transition-all duration-200 transform hover:scale-105"
              >
                {isMiningGood ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Voting...
                  </>
                ) : (
                  <>
                    <span className="text-2xl">✨</span>
                    Good Vibes
                  </>
                )}
              </button>
              <div className="stat bg-success bg-opacity-20 rounded-lg w-full p-4">
                <div className="stat-title text-success">Good Votes</div>
                <div className="stat-value text-success text-3xl">{goodVoteCount}</div>
                {totalVotes > 0 && <div className="stat-desc">{goodPercentage}% of votes</div>}
              </div>
            </div>

            {/* Bad Vibes Button */}
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={handleVoteBad}
                disabled={!connectedAddress || hasVoted || isMiningBad}
                className="btn btn-lg btn-error text-white w-full disabled:opacity-50 disabled:cursor-not-allowed hover:btn-error-focus transition-all duration-200 transform hover:scale-105"
              >
                {isMiningBad ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Voting...
                  </>
                ) : (
                  <>
                    <span className="text-2xl">💔</span>
                    Bad Vibes
                  </>
                )}
              </button>
              <div className="stat bg-error bg-opacity-20 rounded-lg w-full p-4">
                <div className="stat-title text-error">Bad Votes</div>
                <div className="stat-value text-error text-3xl">{badVoteCount}</div>
                {totalVotes > 0 && <div className="stat-desc">{badPercentage}% of votes</div>}
              </div>
            </div>
          </div>

          {/* Total Votes */}
          <div className="divider"></div>
          <div className="stat w-full bg-base-200 rounded-lg">
            <div className="stat-title text-center">Total Votes</div>
            <div className="stat-value text-center text-3xl">{totalVotes}</div>
          </div>

          {/* Progress Bar */}
          {totalVotes > 0 && (
            <div className="w-full space-y-2">
              <div className="flex justify-between text-xs font-semibold text-base-content opacity-70">
                <span>Good: {goodPercentage}%</span>
                <span>Bad: {badPercentage}%</span>
              </div>
              <div className="w-full bg-base-300 rounded-full h-4 overflow-hidden">
                <div className="flex h-full">
                  <div className="bg-success transition-all duration-300" style={{ width: `${goodPercentage}%` }}></div>
                  <div className="bg-error transition-all duration-300" style={{ width: `${badPercentage}%` }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoadingVotes && (
            <div className="flex items-center gap-2">
              <span className="loading loading-spinner loading-sm"></span>
              <span className="text-sm">Loading votes...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
