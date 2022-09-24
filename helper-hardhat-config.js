const { ethers } = require("hardhat")

const networkConfig = {
    4: {
        name: "goerli",
        vrfCoordinatorV2: "0x2bce784e69d2Ff36c71edcB9F88358dB0DfB55b4",
        entranceFee: "100000000000000000",
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        subscriptionId: "2316" , 
        callbackGasLimit: 500000, //500,000
        interval: "30" , 



    },
    31337: {
        name:"hardhat",
        entranceFee: "100000000000000000",
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        callbackGasLimit: 500000, //500,000
        interval: "30" ,


    },
}


const developmentChains = ["hardhat", "localhost"]


module.exports = {
    networkConfig,
    developmentChains,
    entranceFee: "100000000000000000",



}