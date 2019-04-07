pragma solidity ^0.4.24;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false

    mapping(address => bool) private authorizedCallers;             //Store list of authorized callers.

    mapping(address => address[]) private airlineVotes;     // airline address to voters address (registered airliness)
    address[] registeredAirlines;           //list of registered airlines
    address[] activeAirlines;           //list of activated airlines after funding
    mapping(address => bool) private activatedAirlines;     //registered airline to boolean whether activated or not.

    //struct 
    struct Insurance {
        bytes32  id;   //key with flightkey and traveller address
        bool isInsured;// is insured
        bool isCredited;    //is already paid
        uint256 amount;//amount insured for
        address passenger;
    }

    //Map of key(flight+passenger) to insurance instance
    mapping(bytes32 => Insurance) private flightInsurances;

    //map of flight key to insured passengers list
    mapping(bytes32 => address[]) private flightInsurees;

    //map of insuree to amount balance to be paid
    mapping(address => uint256) private insuredAmount;

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /*******************************************s*************************************************/
    event airlineRegistered(address airlineAddress);
    event airlineFunded(address airlineAddress);


    event statusSetToFalse(address sender);
    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor(address firstAirline) public
    {
        contractOwner = msg.sender;
        registeredAirlines.push(firstAirline);
        activatedAirlines[firstAirline] = false;
        activeAirlines.push(firstAirline);
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() 
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier requireIsCallerAuthorized(){
        require(msg.sender == contractOwner || isCallerAuthorized(msg.sender), "Caller not authorized!");
        _;
    }


    modifier requirePassengerNotInsured(address sender, address airline, string flightCode, uint256 timestamp){
        require(!isPassengerInsured(sender, airline, flightCode, timestamp), "Passenger is already insured");
        _;
    }

    modifier requireCallingAirlineActivated(address caller){
        require(activatedAirlines[caller] == true, "Calling airline is not activated.");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */      
    function isOperational() 
                            public 
                            view 
                            returns(bool) 
    {
        return operational;
    }


    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    
    function setOperatingStatus( bool mode
        ) 
        external
        requireContractOwner 
    {
        operational = mode;
        emit statusSetToFalse(contractOwner);
    }


    function authorizeCaller(address contractAddress) external
    requireContractOwner
    {
        authorizedCallers[contractAddress] = true;
    }


    function deauthorizeCaller(address contractAddress) external
    requireContractOwner
    {
        delete authorizedCallers[contractAddress];
    }

    function isCallerAuthorized(address contractAddress) public view
    requireContractOwner
    returns (bool)
    {
        return authorizedCallers[contractAddress];
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerAirline(address newAirline, address caller)
                            external 
                            requireIsOperational
                            requireCallingAirlineActivated(caller)
    {
        //add to registered airlines lists
        registeredAirlines.push(newAirline);
        activatedAirlines[newAirline] = false;
        emit airlineRegistered(newAirline);
    }

    function isAirlineRegistered(address newAirline) external view requireIsOperational returns(bool) {
        for(uint i = 0; i < registeredAirlines.length; i++) {
            if(registeredAirlines[i] == newAirline) {
                return true;
            }
        }
        return false;
    }


    /**
     * @dev check if the airline has voted
     *
     */
    function isAirlineVoted(address newAirline, address sender) external view requireIsOperational returns (bool) {
        bool voted = false;
        for(uint i = 0; i < airlineVotes[newAirline].length; i++) {
            if(airlineVotes[newAirline][i] == sender) {
                voted = true;
            }
        }
        return voted;
    }



    /**
     * @dev add airline vote by the sender
     */
    function addAirlineVotes(address newAirline, address senderAddress) external requireIsOperational returns(address[]) {
        airlineVotes[newAirline].push(senderAddress);
    }


    /**
     * @dev Get the list of registered airlines
     *
     */
    function getRegisteredAirlines() external view requireIsOperational returns(address[]) {
        return registeredAirlines;
    }


    /**
     * @dev Get the list of airline votes given airline 
     *
     */
    function getAirlineVotes(address newAirline) external view requireIsOperational returns(address[]) {
        return airlineVotes[newAirline];
    }

    /**
     * @dev Activate an airline
     *
     */
    function activateAirline(address airlineAddress) external requireIsOperational {
        activatedAirlines[airlineAddress] = true;
        activeAirlines.push(airlineAddress);
        emit airlineFunded(airlineAddress);
    }


    /**
     * @dev Check if the airline is funded/activated
     *
     */
    function isAirlineActivated(address airlineAddress) external view requireIsOperational returns(bool) {
        return activatedAirlines[airlineAddress];
    }



    /**
     * @dev Get the list of activated/funded airlines
     *
     */
    function getActiveAirlines() external view requireIsOperational returns(address[]) {
        return activeAirlines;
    }

   /**
    * @dev Buy insurance for a flight
    *
    */   
    function buy( 
        address sender,
        address airline,
        string flightCode,
        uint256 timestamp,
        uint256 insuranceAmount                             
        )
        external
        requireIsOperational
        requirePassengerNotInsured(sender, airline, flightCode, timestamp)
        payable
    {
        bytes32 flightKey = getFlightKey(airline, flightCode, timestamp);
        bytes32 insKey = getInsuranceKey(flightKey,sender);
        Insurance storage insurance = flightInsurances[insKey];
        insurance.isInsured = true;
        insurance.amount = insuranceAmount;
        insurance.id = insKey;
        insurance.isCredited = false;
        insurance.passenger = sender;
        insuredAmount[sender] = 0;

        flightInsurances[insKey] = insurance;

        updateData(sender, flightKey);
        
    }

    function updateData(address sender, bytes32 flightKey) private {
        //add to insured travellers list for a flight key
        address[] storage insurees = flightInsurees[flightKey];
        //check if insuree already exists 
        bool exists = false;
        for(uint256 i = 0; i < insurees.length; i++) {
            if(insurees[i] == sender) {
                exists = true;
                break;
            }
        }

        if(!exists) {
            insurees.push(sender);
            flightInsurees[flightKey] = insurees;
        }
    }
    

    function isPassengerInsured(address sender, address airline, string flightCode, uint256 timestamp) public 
    returns (bool)
    {
        bytes32 insuranceKey = getInsuranceKey(getFlightKey(airline, flightCode, timestamp),sender);
        Insurance storage insurance = flightInsurances[insuranceKey];
        return insurance.isInsured;
    }

    event GotFlightKey(address[] insurees);
    event GotInsuranceKey(uint256 amount, address passenger, bytes32 id);
    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
    (
        address airline,
        string flightCode,
        uint256 timestamp
    )
        external
        requireIsOperational
    {
        bytes32 flightKey = getFlightKey(airline, flightCode, timestamp);
        address[] storage insurees = flightInsurees[flightKey];
        emit GotFlightKey(insurees);
        for(uint i = 0; i < insurees.length; i++) {
            bytes32 insuranceKey = getInsuranceKey(flightKey,insurees[i]);
            Insurance storage insurance = flightInsurances[insuranceKey];
            emit GotInsuranceKey(insurance.amount, insurance.passenger, insurance.id);
            //update amount=1.5*amount in insurance to be paid if not paid already to the insuree
            if(!insurance.isCredited) {
                insurance.isCredited = true;
                insuredAmount[insurees[i]] = insuredAmount[insurees[i]].add(insurance.amount.div(10).mul(15));
            }
        }
    }
    

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay (address sender) external requireIsOperational 
    {
        //check if sufficient amount is there with the contract
        require(address(this).balance >= insuredAmount[sender], "Error: Not enough funds in contract");
        uint256 insuredFor = insuredAmount[sender];
        //debit first
        insuredAmount[sender] = 0;
        sender.transfer(insuredFor);

    }

    /**
     *  @dev get current balance of insured
     *
    */
    function getInsureeBalance (address sender) external
    requireIsOperational
    view
    returns (uint256)
    {
        return insuredAmount[sender];
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund
                            (   
                            )
                            public
                            payable
    {
    }

    function getFlightKey(
        address airline,
        string memory flight,
        uint256 timestamp
    )
    internal
    returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    function getInsuranceKey(
        bytes32 flightKey,
        address passenger        
    )
    internal
    returns(bytes32) 
    {
        return keccak256(abi.encodePacked(flightKey,passenger));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() 
                            external 
                            payable 
    {
        fund();
    }


}

