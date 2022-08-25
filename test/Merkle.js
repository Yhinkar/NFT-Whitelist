const { expect, use } = require('chai')
const { ethers } = require('hardhat')
const { MerkleTree } = require('merkletreejs')
const { keccak256 } = ethers.utils

//var expect = require('chai').expect;
use(require('chai-as-promised'))

describe('Mytoken', function () {
  it('allow only whitelisted accounts to mint', async () => {
    const accounts = await hre.ethers.getSigners()
    const whitelisted = accounts.slice(0, 5)
    const notWhitelisted = accounts.slice(5, 10)

    const padBuffer = (addr) => {
      return Buffer.from(addr.substr(2).padStart(32*2, 0), 'hex')
    }

    const leaves = whitelisted.map(account => padBuffer(account.address))
    const tree = new MerkleTree(leaves, keccak256, { sort: true })
    const merkleRoot = tree.getHexRoot()
    console.log(`Merkleleaves ===> ${leaves}`);
    console.log(`Merkletree===> ${tree}`);
    console.log(`Merkleroot===> ${merkleRoot}`);
    

    const Whitelist = await ethers.getContractFactory('Mytoken')
    const whitelist = await Whitelist.deploy(merkleRoot)
    await whitelist.deployed()
    console.log("address deployed to", whitelist.address)

    const merkleProof = tree.getHexProof(padBuffer(whitelisted[0].address))
    const invalidMerkleProof = tree.getHexProof(padBuffer(notWhitelisted[0].address))
    console.log("merkle proof==========================>", merkleProof)


    await expect(whitelist.mint(merkleProof)).to.not.be.rejected
    await expect(whitelist.mint(merkleProof)).to.be.rejectedWith('already claimed')
    await expect(whitelist.connect(notWhitelisted[0]).mint(invalidMerkleProof)).to.be.rejectedWith('invalid merkle proof')
  })
})