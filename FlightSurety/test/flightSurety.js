var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    //await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`(multiparty) has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");

  });



  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

    // Ensure that access is denied for non-Contract Owner account
    let accessDenied = false;
    try 
    {
        await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
    }
    catch(e) {
        accessDenied = true;
    }

    assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
  
    });


    it('multiparty) can allow access to setOperatingStatus() for Contract Owner account', async function () {

        // Ensure that access is allowed for Contract Owner account
        let accessDenied = false;
        try 
        {
            await config.flightSuretyData.setOperatingStatus(false, { from: config.owner });
        }
        catch(e) {
            console.log(config.owner);
            accessDenied = true;
        }
        assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
        
    });



  


  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

      await config.flightSuretyData.setOperatingStatus(false , {from: config.owner});

      let reverted = false;
      try 
      {
          await config.flightSuretyApp.activateAirline();
      }
      catch(e) {
          reverted = true;
      }
      assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

      // Set it back for other tests to work
      await config.flightSuretyData.setOperatingStatus(true);

  });


  it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {
    
    // ARRANGE
    let newAirline = config.testAddresses[2];

    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline, {from: config.firstAirline});
    }
    catch(e) {

    }
    let result = await config.flightSuretyData.isAirlineRegistered(newAirline); 

    // ASSERT
    assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");

  });

  //activating firstairlline so that other tests could be done
  it('(airline) check if first airline is activated or not and activate it', async () => {

    let result1 = await config.flightSuretyApp.isAirlineActivated(config.firstAirline);

    assert.equal(result1, false, "first airline is registered but not activated/funded");

    await config.flightSuretyApp.activateAirline(config.firstAirline,{from: config.firstAirline, value:config.weiMultiple*10});

    let result2 = await config.flightSuretyApp.isAirlineActivated(config.firstAirline);

    //assert.equal(result2, false, "first airline is activated now.");

  });

  //register 2nd/3rd/4th airline
  it('(airline) register 3 airlines before multiparty consensus gets used', async () => {
    
    // ARRANGE
    let secondAirline = config.testAddresses[2];
    let thirdAirline = config.testAddresses[3];
    let fourthAirline = config.testAddresses[4];


    // ACT
    try {
        await config.flightSuretyApp.registerAirline(secondAirline, {from: config.firstAirline});
        await config.flightSuretyApp.registerAirline(thirdAirline, {from: config.firstAirline});
        await config.flightSuretyApp.registerAirline(fourthAirline, {from: config.firstAirline});
    }
    catch(e) {

    }

    // ASSERT
    let result1 = await config.flightSuretyApp.isAirlineRegistered(secondAirline);
    assert.equal(result1, true, secondAirline+ " secondAirline not registered");

    let result2 = await config.flightSuretyApp.isAirlineRegistered(thirdAirline);
    assert.equal(result2, true, thirdAirline+ " thirdAirline not registered");

    let result3 = await config.flightSuretyApp.isAirlineRegistered(fourthAirline);
    assert.equal(result3, true, fourthAirline+ " fourthAirline not registered");

  });

 

  //fund 2nd/3rd/4th airline
  it('(airline) activate 3 airlines before multiparty consensus gets used', async () => {
    
    // ARRANGE
    let secondAirline = config.testAddresses[2];
    let thirdAirline = config.testAddresses[3];
    let fourthAirline = config.testAddresses[4];


    // ACT
    try {
        await config.flightSuretyApp.activateAirline(secondAirline, {from: config.firstAirline, value:config.weiMultiple*10});
        await config.flightSuretyApp.activateAirline(thirdAirline, {from: config.firstAirline, value:config.weiMultiple*10});
        await config.flightSuretyApp.activateAirline(fourthAirline, {from: config.firstAirline, value:config.weiMultiple*10});
    }
    catch(e) {

    }

    // ASSERT
    let result1 = await config.flightSuretyApp.isAirlineActivated(secondAirline);
    assert.equal(result1, true, secondAirline+ " secondAirline not activated");

    let result2 = await config.flightSuretyApp.isAirlineActivated(thirdAirline);
    assert.equal(result2, true, thirdAirline+ " thirdAirline not activated");

    let result3 = await config.flightSuretyApp.isAirlineActivated(fourthAirline);
    assert.equal(result3, true, fourthAirline+ " fourthAirline not activated");

  });




  //fund 2nd/3rd/4th airline
  it('(MC) register 5th airline to test multiparty consensus using more than 50% of airlines registered', async () => {
    
    // ARRANGE
    let fifthAirline = config.testAddresses[5];


    // ACT
    try {
        await config.flightSuretyApp.registerAirline(fifthAirline, {from: config.testAddresses[1]});
        await config.flightSuretyApp.registerAirline(fifthAirline, {from: config.testAddresses[2]});
        await config.flightSuretyApp.registerAirline(fifthAirline, {from: config.testAddresses[3]});
    }
    catch(e) {

    }

    // ASSERT
    let result1 = await config.flightSuretyApp.isAirlineRegistered(fifthAirline);
    assert.equal(result1, true, fifthAirline+ "  fifthAirline not registered");

  });


  it('(Insurance) check if purchase insurance is working', async () => {

    //ARRANGE
    let flightCode = "ND1309";
    //let timestamp = Math.floor(Date.now() / 1000);
    let traveller = config.testAddresses[6];

    let result = true;

    try {
        await config.flightSuretyApp.registerFlight(config.firstAirline, flightCode, 0, {
            from: traveller,
            value: config.weiMultiple*1
        });
    } catch (e) {
        result = false;
    }

        assert.equal(result, true, "Unable to purchase insurance");

  });


  it('(insurance) Check if insuree balance is 0 before any claim', async () => {

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
    assert.equal(balance.toNumber(), 0, "insuree balance is not 0, may be its already credited.");
    
  });


});
