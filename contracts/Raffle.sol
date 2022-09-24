//consumer address for vrf: 0xe49097Bf717b8DD1D49f1f1825a3d740Ef5Dba67
//we have authorized our consumer contract to make requests for randomness

//Raffle//
//Enter the lottery (paying some amount)
//Pick a random winnder (verifiably random)
//winner to be selected every x minutes --> compeltely  automated //
//chainlink oracle --> Randomness, Automated Execution (Chainlink Keeprs)


// SPDX-License-Identfier: MIT

//a callback function is a function that is passed as an argument to another function, to be  called back at another time

//msg.value is the amount of wei sent with a message to a contract
pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

//callback request: the limit for how much gas to use for the callback request to your contracts
// fulfillRandomwords() function. It sets a limit for how much computation
//our fulfillrandomwords can be. It protects us from using way too much gas 

error Raffle_NotEnoughETHEntered(); 
error Raffle_TransferFailed() ; 
error Raffle__NotOpen();
error Raffle__UpkeepNotNeeded(uint256 currentBalance, uint256 numPlayers, uint256 raffleState);

/** @title
 * @author meme
 * @notice
 * @dev
 */







//we are going to inherit the  fulfillrandom words function from the vrfconsumebaseV2
contract Raffle is VRFConsumerBaseV2, KeeperCompatibleInterface {
    /* Type declations */
    enum RaffleState{
        OPEN,
        CALCULATING
    } //uin256 0 = 0 = open, 1 = calculating
    
    
    /* State Variables */
    //we declare state variables in the contract
    //we initialize state variables in a constructor 
    uint256 private  immutable i_entranceFee;
    address payable [] private s_players;
    uint64 private immutable   i_subscriptionId; 
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1 ;


    //Lottery variables
    uint256 private immutable  i_interval; 

    address private s_recentWinner; //start out as nobody 
    uint256 private s_state; // to true s or pending, open closed or calculating s
    RaffleState private s_raffleState;
    uint256 private s_lastTimeStamp;
    

    //uint 16 request confirmations:  how many confirmations in chainlink node should wait before responding
    //the loger the node waits, the more secure the random value is. It must be greater than the minimumRequestBlockConfirmations limit on the coordinator contract
    
     //this will be in storage b/c we are going to modify this a lot 
    //payable because we have to pay some players 
    //msg.sender is the address who initiated a function or created a transaction
    //events
    VRFCoordinatorV2Interface private immutable  i_vrfCoordinator;
    bytes32 private immutable i_gasLane;

    // we will use this as a consumer address: 0xe49097Bf717b8DD1D49f1f1825a3d740Ef5Dba67
    event RaffleEnter(address indexed player);
    event RequestedRaffleWinner(uint256 indexed requestId);
    event WinnerPicked(address indexed winner); 




    

      // w we nee to pass the VRFConsimerBaseV2 constructor
    constructor(
    address vrfCoordinatorV2,  // contract/its an address
    uint64 subscriptionId,
    bytes32 gasLane, //keyhash
    uint256 interval, 
    uint256 entranceFee,
    uint32 callbackGasLimit
     

    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_entranceFee = entranceFee; //you are passing parameters to the interface?
        i_vrfCoordinator = VRFCoordinatorV2Interface (vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        s_raffleState = RaffleState.OPEN;
        s_lastTimeStamp = block.timestamp;
        i_interval = interval; 



    }

    //vrf:
    //msg.value is the eth we are paying

    function enterRaffle() public payable{
        //require msg.value > i_entranceFee, "Not enough Eth" //storing this string is more expensvie 
        if(msg.value < i_entranceFee){
            revert Raffle_NotEnoughETHEntered();
        }

        if (s_raffleState != RaffleState.OPEN){
            revert Raffle__NotOpen();
        }
    
        s_players.push(payable(msg.sender));
        //Events: wheenver we update a dynmamic object like an array or a mapping, we use events 
        //we always emit evetns ^ for dynamic data strucutres 
        //logging and events
        //viewing events
        //events in hardhat
        //named events with the function name  reversed
        emit RaffleEnter(msg.sender);
        //emit event when we update dynamic array or mapping
    }




//EVM can emit logs
//when things happen on a blockchain, the EVM writes these things  to a specific data strucutre called a log


 //it is pissible to store data in a specially data structure that maps all the way up to
 // the block level..this feature called logs is used in solidty in order to implement events. contracts cannot access log data
 //after it has been created, but they can be accessed from outside the blickchain...some of these
 //data is stored in bloom filters...this data can  be seartched for in an effienct and cryptosecure way...that way
 //network peers don not download the whole bloclchain (light cients)
 //they are in json formatt
 //we can read these logss from our blockchain nodes


//events allow you to print stuff to this log..more gas efficient than saving into something like a storage variable 

//this data strucure isn't accesible for smart contracts 
//we can print some information without having to save it to a  storea ge variable

//each one of these events is tied to the smart contract address that emmited this event
//in these transactions .


//it is helpful to lsiten to these events :
//i.e trasnfer function gets called by someone 
//this is better than reading all and the variables and looking  for  sometinh to flip and switch  
//just listen for an event 


//when an page is loading, that means the web page was listening for a event, for a transaction
//to complete 


// i,e  a chain link node is actually listening for request data events  to get a random number,  make an api call
//in an event, there are indexed and non indexed paraamters


//topics are indexed paramters

//index paramters are paramters that are much easier to search for and query

//non abi are hard to search for because they get ap encorded and are harder to search for 

//VRFConsumerBaseV2base constructor, pass that verf coordinator//// vrf corodinaror is the address of the contract that does the random nunmber verification


/** if it is true, that means it's time to get a new random winner
 * @dev This is the 'upkeepneeded'   function that the Chainlink Keeper nodes call
 they look for the  return true.
 The following should be true in order to return true 
 1. Our time interval should have passed
 2. the lottery should have at least 1 player,  and have some eth 
 3. our subscription is funded with Link 
4. the lottery should be in an open state 
5. we need to know wheterh the lottery is open or not, because we don't want to allow any new players to join
//while we are waiting for new players to join

 */ 


  //perform data for the upkeepNeeded variable
  // checkdata for calldata
  //needs to be funded with link 
    function checkUpkeep(bytes memory) public  override returns (bool upkeepNeeded, bytes memory) { 
//we can speciify anything we want 


    bool isOpen = (RaffleState.OPEN == s_raffleState);
    bool timePassed = ((block.timestamp - s_lastTimeStamp) > i_interval) ;
    bool hasPlayers = (s_players.length > 0);
    bool hasBalance = address(this).balance > 0 ; //to see if we have enough link
    upkeepNeeded = ( isOpen && timePassed && hasPlayers && hasBalance);// if this is true, it is time to start a new lottery 
    // block.timestamp - last block timestamp




    }
//if it is a public function, it is clear they are trying to send a transaction . i want to simulate sending this transaction 

    



//the bytes data type in solidity is a dynamiclaly sized bye[] array







//

    function performUpkeep(bytes calldata ) external  override { // THIS FUNCTION RETURNS A REQUEST ID, A 256 REQUEST ID  THAT DEFINES WHO IS REQUESTING
        //Request the random number
        //once we get it, do something with it 
        
        // 2 transaction process ...Otherwise, people could just brute force tries simulating  calling this transaction
       
        (bool upkeepNeeded, ) = this.checkUpkeep(""); //calldata doesn't work with strings...you can't pass an empty string
        if (!upkeepNeeded){
           revert Raffle__UpkeepNotNeeded(address(this).balance,  s_players.length, uint256(s_raffleState));
       }


        s_raffleState = RaffleState.CALCULATING;
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane, //replace keyhash with gaslane/ the max amount of gas you are willing to pay for a request in wei
            i_subscriptionId, //needs to funded with link
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS 
        );
        //this is redundant

        emit RequestedRaffleWinner(requestId);
    
    //storage is permantet...the variables remain after execution
    //memmory variables are stored temproarily and are reset after execution 
    
    
    
}


//think of this as fulfilling random numbers 
    function fulfillRandomWords(
        uint256, /*requestId*/ 
        uint256[]  memory randomWords) internal override {

        //s_players size 10
        //randomNumber 200
        //200%

        uint256 indexOfWinner = randomWords[0] %s_players.length ;// because we are getting one random wrod 
        address  payable recentWinner = s_players[indexOfWinner];
        s_recentWinner = recentWinner;
        s_raffleState = RaffleState.OPEN;
        s_players = new address payable[] (0); // 
        s_lastTimeStamp = block.timestamp;
        //after we pick a player from s_players, we need to reset the array to a size of 0
        //we reset the raffle state and the players array
        (bool success, ) = recentWinner.call{value: address(this).balance}(""); //pass no data

        //"this" is the pointer to the current instance of the type deried
        //require (success)

        if (!success){

            revert Raffle_TransferFailed();



        }

        emit WinnerPicked(recentWinner);
    }


   

//"this" refers contract address

    /* View / Pure functions */


    function getEntranceFee() public view returns(uint256){
        return i_entranceFee; 
    }


    function getPlayer(uint256 index) public view returns(address) {

        return s_players[index];


    }

    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }


    function getRaffleState() public view returns (RaffleState){

        return s_raffleState;
    }

    function getNumWords() public pure returns(uint256) { //it is not reading from storage b/c NUM_WORDS is a constant
        return NUM_WORDS; // NUM_WORDS is in the byte code, since it's a constant/not reading from storage
    } //it will read the number 1 ...


    function getNumberOfPlayers() public  view returns(uint256) {

        return s_players.length;


    }

    function getLatestTimeStamp() public view returns(uint256) {

        return s_lastTimeStamp ; 



    }

    function getRequestConfirmations() public pure returns(uint256){ //pure b/c this is a constant function


        return REQUEST_CONFIRMATIONS;
    }

    function getInterval() public view returns (uint256) {
        return i_interval;
    }

    
//view and pure...these are get functions

//this refers to the instance of the contract  where the call is made

//address(this) refers to the address of the instacne of the contract where the call is being made 


}

//checkupkeep method is used off chain. the gas is not used on chains. it is run by a chainlink node 
//check up keep means  is it checking to see if it is time for us to get a random number to update
// the recent winner and send them all the funds