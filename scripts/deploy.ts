import { ethers } from "hardhat";

async function main() {

  const merkle= await ethers.getContractFactory(
    "Mytoken"
  );
  const Merkle= await merkle.deploy();
  await Merkle.deployed();

  console.log("Lottery contract deployed to: ", Merkle.address);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });