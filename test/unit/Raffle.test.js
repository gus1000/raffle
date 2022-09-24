const {assert, expect} = require("chai")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const {developmentChains, networkConfig} = require("../../helper-hardhat-config")

!developmentChains.includes(network.name) 
    ? describe.skip
    //otherwise
    : describe("Raffle Unit Tests",  function () {
        let raffle, vrfCoordinatorV2Mock, raffleEntranceFee, deployer, interval
        const chainId = network.config.chainId


        beforeEach(async function() {
            //we furst get the deployer and the instance of the contract...we need to grab an account and wait deployments first
            //and we must get the contract for vrfcorrdinatormock as well
            deployer = (await getNamedAccounts()).deployer
            await deployments.fixture(['all'])
            raffle = await ethers.getContract("Raffle", deployer)
            vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
            raffleEntranceFee = await raffle.getEntranceFee()
            interval = await raffle.getInterval()
         })

        describe("constructor ",  function () {
            it ("Initializes the raffle correctly ", async function () {
                //ideally, we make our tets just have one assrt per it
                const raffleState = await raffle.getRaffleState() //this will be a big number
                assert.equal(raffleState.toString(),"0")
                assert.equal(interval.toString(), networkConfig[chainId]["interval"]) //string b/c interval is a large number
                // we are using the interval from the network config
                //assert tests whether a given expression is true oe nor


            })
        





        })

        describe("enterRaffle",  function() {
            it("reverts when you don't pay enough", async function() {
                await expect(raffle.enterRaffle()).to.be.revertedWith( // is reverted when not paid enough or raffle is not open
                "Raffle_NotEnoughETHEntered"
                )
                


            })
            it("records players when they enter", async function(){
                //raffle Entrance Fee
                await raffle.enterRaffle({value: raffleEntranceFee})
                const playerFromContract = await raffle.getPlayer(0)
                assert.equal(playerFromContract, deployer)




            })
            it("emits events on enter", async function() {
                await expect(raffle.enterRaffle({value: raffleEntranceFee})).to.emit(raffle, "RaffleEnter")



            })
            it("it doest allow entrance when raffle is calculating", async function(){
                await raffle.enterRaffle( {value: raffleEntranceFee })//the network sets the interval. It is in s the config
                await network.provider.send("evm_increaseTime", [interval.toNumber() - 1]) // mined a block and increased the block time interval
                await network.provider.send("evm_mine", []) //mine it with one extra block 

                // We pretend to be a chainlink keeper
                await raffle.performUpkeep([]) // pass empty call data
                await expect(raffle.enterRaffle({value: raffleEntranceFee})).to.be.revertedWith("Raffle__NotOpen")





            })





        })

        describe("checkUpkeep",  function(){
            it("returns false if people haven't sent any  eth", async function () {
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.send("evm_mine", [])
                await raffle.checkUpkeep([]) //kicks off a transaciton b/c it is a public function/ trying to send a transaction
                
                const{upkeepNeeded} = await raffle.callStatic.checkUpkeep([]) //call static is used for simulating transaction calls 
                                                                                //give me the return of upkeep and the bytes return data
                assert(!upkeepNeeded)



            })
            it("returns false if raffle  isn't open", async function(){
                await raffle.enterRaffle({value: raffleEntranceFee})
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.send("evm_mine", [])
                await raffle.performUpkeep([]) // a blank object 
                const raffleState = await raffle.getRaffleState()
                const {upkeepNeeded} = await raffle.callStatic.checkUpkeep([])
                assert.equal(raffleState.toString(), "1")
                assert.equal(upkeepNeeded, false)




            })


            it("returns false if enough time hasn't passed", async function() {

                await raffle.enterRaffle({value: raffleEntranceFee})
                await network.provider.send("evm_increaseTime", [interval.toNumber() - 1])
                await network.provider.request({method: "evm_mine", params: []})
                const {upkeepNeeded} = await raffle.callStatic.checkUpkeep("0x")
                assert(!upkeepNeeded)


            })

            it("returns true if enough time has passed, has players, eth and is open", async function() {
                await raffle.enterRaffle({value: raffleEntranceFee})
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.request({method: "evm_mine", params: []})
                const{upkeepNeeded} = await raffle.callStatic.checkUpkeep("0x")
                assert(upkeepNeeded)


            })

        })
        describe("performUpkeep", function(){
            it("it can only run if  checkupkeep is true", async function(){
                await raffle.enterRaffle({value: raffleEntranceFee})
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.send("evm_mine", [])
                const tx = await raffle.performUpkeep([])
                assert(tx) // will fail if tranasction error outs or doesn't work

                // we want this to work only if check up keep is true 



            })
            it("it reverts  when checkupkeep is false", async function() {

                await expect(raffle.performUpkeep([])).to.be.revertedWith(
                    "Raffle__UpkeepNotNeeded" // it reversts the balance of the address, length of the players array and the raffle state 
                )
            })
          
            it("updates the raffle state, emits and  event, and calls the vrf coordinator", async function(){
                await raffle.enterRaffle({value: raffleEntranceFee})
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.send("evm_mine", [])
                const txResponse = await raffle.performUpkeep([])
                const txReceipt = await txResponse.wait(1)
                const requestId = txReceipt.events[1].args.requestId
                const raffleState = await raffle.getRaffleState()
                assert(requestId.toNumber() > 0)
                assert(raffleState.toString() == 1)
            })
        })
        describe("fulfillRandomwords", function(){
            beforeEach(async function() {
                await raffle.enterRaffle({value: raffleEntranceFee})

                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.send("evm_mine", [])



            })
            it("it can only be called after perform upkeep", async function () {
                await expect(vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address)).to.be.revertedWith("nonexistent request")
                await expect(vrfCoordinatorV2Mock.fulfillRandomWords(1, raffle.address)).to.be.revertedWith("nonexistent request")

            })
            //way to big 
            it("picks a winner, resets the lottery, and sends money", async function ()  {

                const additionalEntrants = 3
                const startingAccountIndex = 1 // deployer = 0
                const accounts = await ethers.getSigners()

                for( let i = startingAccountIndex; i < startingAccountIndex + additionalEntrants; i++ ) {
                    const accountConnectedRaffle = raffle.connect(accounts[i])
                    await accountConnectedRaffle.enterRaffle({value: raffleEntranceFee})
                }
                const startingTimeStamp = await raffle.getLatestTimeStamp()

                //perform upkeep (mock being chainlink keeprs)
                //fullfullrandomwords (mock being chainlink keerps)
                //we will have to wait for the fullfill randomwords to be called
                await new Promise(async (resolve, reject) => {
                    
                    raffle.once("Winner Picked", async () => { 
                        console.log("WinnerPicked event fired!")
                        try {
                        
                            const recentWinner = await raffle.getRecentWinner()
                            const raffleState = await raffle.getRaffleState()
                            const endingTimeStamp = await raffle.getLastestTimeStamp()
                            const numPlayers = await raffle.getNumberOfPlayers()//checks whether our raffle is reset
                            const winnerEndingBalance = await accounts[1].getBalance() //they get paid
                            assert.equal(numPlayers.toString(), "0")
                            assert.equal(raffleState.toString(), "0")
                            assert(endingTimeStamp > startingTimeStamp)

                            
                            assert.equal(winnerEndingBalance.toString(), winnerStartingBalance.add(raffleEntranceFee.mul(additionalEntrants).add(raffleEntranceFee)))

                            //this is all the money that has been added
                        } catch (e){
                            reject(e)

                        }
                        resolve()


                    
                    // we are listneing for this event that got emmited
                    //we want to wait for the winner to be picked 
                    //we need to call perform upkeep and fulfill random words first though 

                        //promise will resolve if its inside the code 
                    })    //project fails if  event doesnt fire  after 200 seconds if it doesn't fire
                    

                   

                
                    //setting up the listerner
                    //below we will fire the event, and the listener will pick it up, resolve 
                    //we want to pretend the random number was drawn...it calls a random number
                    const tx = await raffle.performUpkeep([])
                    const txReceipt = await tx.wait(1)
                    const winnerStartingBalance = await accounts[1].getBalance()
                    await vrfCoordinatorV2Mock.fulfillRandomWords(
                        txReceipt.events[1].args.requestId,
                        raffle.address
                        //we test once this transactuin is called
                    )//this function should emit a winnder picked event 
                })
            })

            //this code runs only if that transaction is caused once event is called

            
//in a mock network, we know exactly hwne this is going to run 

//our consumer is our raffle contract


        })
    })

        






    

        


        
            





            

  
  


