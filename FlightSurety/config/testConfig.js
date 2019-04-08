
var FlightSuretyApp = artifacts.require("FlightSuretyApp");
var FlightSuretyData = artifacts.require("FlightSuretyData");
var BigNumber = require('bignumber.js');

var Config = async function(accounts) {
    
    // These test addresses are useful when you need to add
    // multiple users in test scripts
    let testAddresses = [
        "0xfc725fcebcfd19bbd34257dfbceff25c1830c25f",
        "0xfbfd4fbf3b2e8082ee09ab9b8f2cb3b18541d255",    //firts airline
        "0x0850dd493df96ab250f100cdb2ff0d357df1e309",    //second airline
        "0x6cf531a7347423959321ebb808498e999768fd12",    //third airline
        "0x61d8033486bf5aa07e4b8d5e9bf2dcf8375ff06a",    //forth airline
        "0x5c476abb1289730008b0c462f4e53c1c2646b523",    //fifth airline
        "0x821303ab6c1e31126bc96bd98061ea833c641460",
        "0x9868b3d991c2dd3f8cbbdee3bd4fd677a0f09952",
        "0x5f398b65ffd9613cfffd70c1e1637ee955b16ea9",
        "0xc0ee672a57b5b87b73fed19f3ff56909ade70ab1"

    ];


/*(0) 0xfc725fcebcfd19bbd34257dfbceff25c1830c25f   //owner
(1) 0xfbfd4fbf3b2e8082ee09ab9b8f2cb3b18541d255
(2) 0x0850dd493df96ab250f100cdb2ff0d357df1e309
(3) 0x6cf531a7347423959321ebb808498e999768fd12
(4) 0x61d8033486bf5aa07e4b8d5e9bf2dcf8375ff06a
(5) 0x5c476abb1289730008b0c462f4e53c1c2646b523
(6) 0x821303ab6c1e31126bc96bd98061ea833c641460
(7) 0x9868b3d991c2dd3f8cbbdee3bd4fd677a0f09952
(8) 0x5f398b65ffd9613cfffd70c1e1637ee955b16ea9
(9) 0xc0ee672a57b5b87b73fed19f3ff56909ade70ab1*/


    let owner = testAddresses[0];
    let firstAirline = testAddresses[1];

    let flightSuretyData = await FlightSuretyData.new(firstAirline);
    let flightSuretyApp = await FlightSuretyApp.new(flightSuretyData.address);

    
    return {
        owner: owner,
        firstAirline: firstAirline,
        weiMultiple: (new BigNumber(10)).pow(18),
        testAddresses: testAddresses,
        flightSuretyData: flightSuretyData,
        flightSuretyApp: flightSuretyApp
    }
}

module.exports = {
    Config: Config
};