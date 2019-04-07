var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Oracles', async (accounts) => {

    const TEST_ORACLES_COUNT = 7;
    const STATUS_CODE_UNKNOWN = 0;
    const STATUS_CODE_ON_TIME = 10;
    const STATUS_CODE_LATE_AIRLINE = 20;
    const STATUS_CODE_LATE_WEATHER = 30;
    const STATUS_CODE_LATE_TECHNICAL = 40;
    const STATUS_CODE_LATE_OTHER = 50;

    var config;
    before('setup contract', async () => {
        config = await Test.Config(accounts);

        // Watch contract events
    });

    it('can register oracles', async () => {

        // ARRANGE
        let fee = await config.flightSuretyApp.REGISTRATION_FEE.call();

        // ACT
        for (let a = 1; a < TEST_ORACLES_COUNT; a++) {
            await config.flightSuretyApp.registerOracle({from: accounts[a], value: fee});
            let result = await config.flightSuretyApp.getMyIndexes.call({from: accounts[a]});
            console.log(accounts[a]);
            console.log(`Oracle Registered: ${result[0]}, ${result[1]}, ${result[2]}`);
        }
    });

    it('can request flight status', async () => {

        // ARRANGE
        let flight = 'ND1309'; // Course number
        let timestamp = 0;

        // Submit a request for oracles to get status information for a flight
        await config.flightSuretyApp.fetchFlightStatus(config.firstAirline, flight, timestamp);
        // ACT

        // Since the Index assigned to each test account is opaque by design
        // loop through all the accounts and for each account, all its Indexes (indices?)
        // and submit a response. The contract will reject a submission if it was
        // not requested so while sub-optimal, it's a good test of that feature
        for (let a = 1; a < TEST_ORACLES_COUNT; a++) {

            // Get oracle information
            let oracleIndexes = await config.flightSuretyApp.getMyIndexes.call({from: accounts[a]});
            for (let idx = 0; idx < 3; idx++) {

                try {
                    // Submit a response...it will only be accepted if there is an Index match
                    await config.flightSuretyApp.submitOracleResponse(oracleIndexes[idx], config.firstAirline, flight, timestamp, STATUS_CODE_LATE_AIRLINE, {from: accounts[a]});
                    console.log('\Success', accounts[a], idx, oracleIndexes[idx].toNumber(), flight, timestamp);
                    balance = await config.flightSuretyApp.getInsureeBalance({from: config.testAddresses[6]});
                    console.log('++++',balance);
                } catch (e) {
                    // Enable this when debugging
                    console.log('\nError', accounts[a],idx, oracleIndexes[idx].toNumber(), flight, timestamp);
                }

            }
        }


    });



/*    it('(passenger ) check if new balance in insuree account is non zero or not after insurace payment', async () => {
      let result1 = await config.flightSuretyApp.isAirlineActivated(config.firstAirline);
      console.log('*******',result1);
      assert.equal(result1, false, "first airline is registered but not activated/funded");

      // ARRANGE
      let traveller = config.testAddresses[6];
      let balance = 0;
      let result = true
      //ACT
      try {
        balance = await config.flightSuretyApp.getInsureeBalance({from: traveller});
      } catch (e) {
          result = false;
      }
  
      // ASSERT
      assert.equal(result, true, "Error in getting insuree balance.");
      assert.equal(balance.toNumber() > 0, "insuree balance is not successfully credited");
      
    });
  
    it('(passenger) Check if withdrawal is successful', async () => {
      let traveller = config.testAddresses[6];
      //wallet balance before withrawal
      let initialBalance = await web3.eth.getBalance(traveller);
      let balance = 100;
  
      let result = true;
      try {
        await config.flightSuretyApp.withdrawInsuranceAmount({from: traveller});
        balance = await config.flightSuretyApp.getInsureeBalance({from: traveller});
      }
      catch(e) {
          result = false;
      }
      //new balance should be with traveller wallet
      let currentBalance = await web3.eth.getBalance(traveller);
      assert.equal(result, true, "Withdrawal not confirmed.");
      assert.equal(balance.toString(), "0", "Withrawal not successful");
      assert.equal(new BigNumber(currentBalance.toString()).isGreaterThan(new BigNumber(initialBalance.toString())), true, "wallet balance is not matching");
    });*/
  


});
