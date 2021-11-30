const Token = artifacts.require("Token");
const EthSwap = artifacts.require("EthSwap");

module.exports = async function (deployer) {
    //Deploy Token
    await deployer.deploy(Token);
    const token = await Token.deployed();


    //Deploy EthSwap
    await deployer.deploy(EthSwap,token.address);
    const ethSwap1 = await EthSwap.deployed();
    
    //Transfer all tokens to EthSwap (1 million)
    await token.transfer(ethSwap1.address, '1000000000000000000000000')
};

// module.exports = function (deployer) async =>{
//     //Deploy Token
//     await deployer.deploy(Token);
//     const token = await Token.deployed();

//     //Deploy EthSwap
//     await deployer.deploy(EthSwap, token.address);
//     const ethSwap = await EthSwap.deployed();

//     //Transfer all tokens to EthSwap (1 million)
//     await token.transfer(ethSwap.address, '1000000000000000000')
// }