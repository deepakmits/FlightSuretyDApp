import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';

import Config from './config.json';
import Web3 from 'web3';
import express from 'express';


let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
let flightSuretyData = new web3.eth.Contract(FlightSuretyData.abi, config.appAddress);


const TEST_ORACLES_COUNT = 20;

const STATUS_CODE_UNKNOWN = 0;
const STATUS_CODE_ON_TIME = 10;
const STATUS_CODE_LATE_AIRLINE = 20;
const STATUS_CODE_LATE_WEATHER = 30;
const STATUS_CODE_LATE_TECHNICAL = 40;
const STATUS_CODE_LATE_OTHER = 50;

const STATUS_CODES  = [STATUS_CODE_UNKNOWN, STATUS_CODE_ON_TIME, STATUS_CODE_LATE_AIRLINE, STATUS_CODE_LATE_WEATHER, STATUS_CODE_LATE_TECHNICAL, STATUS_CODE_LATE_OTHER];

function getFlightStatusRandom() {
  return STATUS_CODES[Math.floor(Math.random() * 6)];
}

//
let oracles = [];

// Registeration of Oracles following same as 
web3.eth.getAccounts((error, accounts) => {
  if(error) console.log(error);
  else
  flightSuretyApp.methods
    .REGISTRATION_FEE()
    .call({ from: accounts[0]}, (error, result) => {
      if(error) {
        console.log(error);
      } else {
        let registrationFee = result;
        for(let idx=21; idx < 41; idx++) {
          flightSuretyApp.methods
            .registerOracle()
            .send({ from: accounts[idx], value: registrationFee, gas: 3000000}, (registration_error, registration_result) => {
              if(registration_error) {
                console.log(registration_error);
              } else {
                flightSuretyApp.methods
                  .getMyIndexes()
                  .call({ from: accounts[idx]}, (get_error, get_result) => {
                    if (get_error) {
                      console.log(get_error);
                    } else {
                      let oracle = {
                        address: accounts[idx],
                        indexes: get_result
                      };
                      oracles.push(oracle);
                      console.log("Oracle registered: " + JSON.stringify(oracle));
                    }
                  });
              }

            });
        }
      }
    });
});

  
flightSuretyApp.events.OracleRequest({
    fromBlock: 0
  }, function (error, event) {
    if (error) console.log(error)
    else {
      let index = event.returnValues.index;
      let airline = event.returnValues.airline;
      let flight = event.returnValues.flight;
      let timestamp = event.returnValues.timestamp;
      let statusCode = getFlightStatusRandom()    
      // Fetch Indexes for Oracle Accounts
      for(let idx=0; idx < oracles.length; idx++) {  
        if(oracles[idx].indexes.includes(index)) {
          console.log("Oracle response matched : " + JSON.stringify(oracles[idx]));
          // Submit Response         
          flightSuretyApp.methods
            .submitOracleResponse(index, airline, flight, timestamp, statusCode)
            .send({ from: oracles[idx].address}, (error, result) => {
              if(error) {
                console.log(error);
              } else {
                console.log("Oracle Response Submitted: " + JSON.stringify(oracles[idx]) + " with Status Code: " + statusCode);
              }
            });
        }
      }
    }
    console.log(event)
});


flightSuretyData.events.GotFlightKey({
  fromBlock: "latest"
}, function (error, event) {
  if (error) console.log(error)
  else {
    let ins = event.returnValues.insurees;
    for( var i=0;i<ins.length;i++ ){
      console.log("+++++++"+ins[i]);
    }
  }
  console.log(event)
});


flightSuretyData.events.GotInsuranceKey({
  fromBlock: "latest"
}, function (error, event) {
  if (error) console.log(error)
  else {
    let ins = event.returnValues.insurance;
    console.log("id: "+ins.id+" passenger : "+ins.passenger+" amount : "+ins.amount);
  }
  console.log(event)
});


const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;


