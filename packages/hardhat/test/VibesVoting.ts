import { expect } from "chai";
import { ethers } from "hardhat";
import { VibesVoting } from "../typechain-types";

describe("VibesVoting", function () {
  let vibesVoting: VibesVoting;
  let addr1: any;
  let addr2: any;
  let addr3: any;

  before(async () => {
    const [address1, address2, address3] = await ethers.getSigners();
    addr1 = address1;
    addr2 = address2;
    addr3 = address3;

    const vibesVotingFactory = await ethers.getContractFactory("VibesVoting");
    vibesVoting = (await vibesVotingFactory.deploy()) as VibesVoting;
    await vibesVoting.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should initialize with 0 votes", async function () {
      const votes = await vibesVoting.getVotes();
      expect(votes[0]).to.equal(0n);
      expect(votes[1]).to.equal(0n);
    });
  });

  describe("Voting", function () {
    it("Should allow voting good", async function () {
      await vibesVoting.connect(addr1).voteGood();
      const votes = await vibesVoting.getVotes();
      expect(votes[0]).to.equal(1n);
      expect(votes[1]).to.equal(0n);
    });

    it("Should allow voting bad", async function () {
      await vibesVoting.connect(addr2).voteBad();
      const votes = await vibesVoting.getVotes();
      expect(votes[0]).to.equal(1n);
      expect(votes[1]).to.equal(1n);
    });

    it("Should prevent voting twice", async function () {
      await expect(vibesVoting.connect(addr1).voteGood()).to.be.revertedWith("You have already voted");
    });

    it("Should prevent voting bad twice", async function () {
      await expect(vibesVoting.connect(addr2).voteBad()).to.be.revertedWith("You have already voted");
    });

    it("Should track hasVoted correctly", async function () {
      expect(await vibesVoting.hasVoted(addr1.address)).to.equal(true);
      expect(await vibesVoting.hasVoted(addr2.address)).to.equal(true);
      expect(await vibesVoting.hasVoted(addr3.address)).to.equal(false);
    });

    it("Should allow a third user to vote", async function () {
      await vibesVoting.connect(addr3).voteGood();
      const votes = await vibesVoting.getVotes();
      expect(votes[0]).to.equal(2n);
      expect(votes[1]).to.equal(1n);
      expect(await vibesVoting.hasVoted(addr3.address)).to.equal(true);
    });
  });
});
