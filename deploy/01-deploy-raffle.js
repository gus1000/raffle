const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const {verify} = require ("../helper-hardhat-config")
module.exports = async function( {getNamedAccounts, deployments}) {

    const {deploy, log} = deployments
    const {deployer} = await getNamedAccounts()
    const chainId = network.config.chainId
    const VRF_SUB_FUND_AMOUNT = "1000000000000000000000" // we get an over flow error if we use  this is as an interger

    let vrfCoordinatorV2Address, subscriptionId
    //fund the subscription
    //usually, you need the link token on a real network

   //you need the contract...you need the contract address
   //and you need to create a subcription transaction/and you wait for the receipt

    if(chainId == 31337) {

        //create VRF2 subscription 
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        const transactionResponse = await vrfCoordinatorV2Mock.createSubscription()
        const transactionReceipt = await transactionResponse.wait(1)
        subscriptionId = transactionReceipt.events[0].args.subId
        //possivle issues below ?



        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT)



    } else {
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"]
        subscriptionId = networkConfig[chainId]["subscriptionId"]

    }
    //problems...trouble shoot below

    const entranceFee = networkConfig[chainId]["entranceFee"]
    const gasLane = networkConfig[chainId]["gasLane"]
    const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"]
    const interval = networkConfig[chainId]["interval"]
    //the order of args should match the order in the constructor of the contract
    const args = [vrfCoordinatorV2Address, subscriptionId, gasLane,  interval, entranceFee, callbackGasLimit  ]

    const raffle = await deploy("Raffle", {

        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,

    })
    //problems above 

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying....")
        await verify(raffle.address, args)

    }

    log("---------------------------------------------")



}


module.exports.tags = ["all" , "raffle"]