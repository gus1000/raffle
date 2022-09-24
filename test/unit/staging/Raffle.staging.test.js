const {assert, expect} = require("chai")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const {developmentChains} = require("../../helper-hardhat-config")
//? if we are on a development chain, do something 
developmentChains.includes(network.name) 
    ? describe.skip
    : describe("Raffle Unit Tests",  function () {
        let raffle, raffleEntranceFee, deployer


        beforeEach(async function() {
                //we furst get the deployer and the instance of the contract...we need to grab an account and wait deployments first
                //and we must get the contract for vrfcorrdinatormock as well
            deployer = (await getNamedAccounts()).deployer
            raffle = await ethers.getContract("Raffle", deployer)
            raffleEntranceFee = await raffle.getEntranceFee()
        })

        describe("fulfillRandomwords", function(){
            it("works with live Chainlink Keeprs and Chainlink VRF/we get a random winner", async function (){
                // enter the raffle
                const startingTimeStamp = await raffle.getLatestTimeStamp()
                const accounts = await ethers.getSigners() // we cant use deployer object above
                await new Promise(async (resolve, reject) => {
                    raffle.once("WinnerPicked", async () => {
                        console.log("WinnerPicked event")
                        try{


                        //add our asserts here
                        const recentWinner = await raffle.getRecentWinner()
                        const raffleState = await raffle.getRaffleState()
                        const winnerBalance = await accounts[0].getBalance()
                        const endingTimeStamp = await raffle.getLatestTimeStamp()
                        //check if our players array has been reset
                        await expect(raffle.getPlayer(0)).to.be.reverted
                        //there is no object at zero, so get Player should be reverted to 0 ...another way to check if our players arrays has been reset to 0 
                        assert.equal(recentWinner.toString(), accounts[0].address) //winner should equal our accounts address/deployer

                        assert.equal(raffleState, 0) //we want the  enum  to return to  enum after we are 
                        assert.equal(winnerEndingBalance.toString(), winnerStartingBalance.add(raffleEntranceFee).toString())








                        assert(endingTimeStamp > startingTimeStamp)
                        resolve()

                        // we will catch these errors if there are any issues wuth these assert functions  and then we will reject
                        //and raffle once will be false 
                        } catch(error){
                            console.log(error)
                            reject(e)
                        }


                    })

                    //then entering the raffle 
                    await raffle.enterRaffle({ value: raffleEntranceFee})
                    //we then check their starting balance
                    const winnerStartingBalance = await accounts[0].getBalance()




                    
                    


                //adn this code WONT complete until our listener has finished listening !
                })
                
                
                // set up a listener before we enter the raffle
                //just in case the blockchian moves really fast 
                // await raffle.enterRaffle({value: raffleEntranceFee})


            })

        })
    })







    /*what we need
    1. Get our  SubId for chainlink VRF
    2.deploy our contract using the subId
    3. Register the contract with chainlink VRF & it's subId
    4. Register the contract with the Chainlink Keepers
    5. Run Staging tests 


    THe user interface for the vrf  is helping us faccilitate  call contracts to the registartion contract that is decentralized and on chain




    

    */