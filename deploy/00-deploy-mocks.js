
const { getNamedAccounts, deployments, network, ethers } = require("hardhat")

const {developmentChains, networkConfig} = require ("../helper-hardhat-config")

//we need a string for the const BASE FEE/ othwise you get an overflow

const BASE_FEE = "250000000000000000"// 0.25 is the premium . it costs .25 link per request 
//it is usally paid for by sponsors but we pay the link b/c this is a mock network

const  GAS_PRICE_LINK = "1000000000" //1000000000// link per gas //CALCULATED VALIE BASED ON THE  GAS  PRICE OF THE CHAIN

// eth price 1,000,000,000
//chainlink nodes pay the gas fees to give us   external execution  and randomness 
//i.e they pay the fulfill and upkeep functions and randomness
//so they  price the requests change based on the price of gas

module.exports = async function ({getNamedAccounts, deployments}) {
    const {deploy, log} = deployments
    const {deployer} = await getNamedAccounts()
    const chainId = network.config.chainId
    const args = { BASE_FEE , GAS_PRICE_LINK}

///////////check below for trouble shooting 

    if (developmentChains.includes(network.name)){

        log("Local network detected ! Deploying mocks")
        // deploy a mock vrfcoordinator...
        await deploy ("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true, 
            args: [BASE_FEE, GAS_PRICE_LINK],
        })
            
        log("Mocks deployed")
        log("----------------------------------------------")


    }
  










    

}




module.exports.tags = [ "all", "mocks"]

