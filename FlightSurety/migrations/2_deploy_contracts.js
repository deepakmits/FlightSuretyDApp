const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");
const fs = require('fs');

module.exports = function(deployer) {

    //ganache-
    //let owner = '0x07Ea69b139559BA768E249Ce2c550f650C23cb34';
    //let firstAirline = '0xb0e53AB378918683ECd716aBb3171861c3f5FFf9';

    //Truffle - 
    let owner = '0xfc725fcebcfd19bbd34257dfbceff25c1830c25f';
    let firstAirline = '0xfbfd4fbf3b2e8082ee09ab9b8f2cb3b18541d255';
    deployer.deploy(FlightSuretyData, firstAirline, {from: owner}).then(() => {
        return deployer.deploy(FlightSuretyApp, FlightSuretyData.address, {from: owner}).then(() => {
            let config = {
                        localhost: {
                            url: 'http://localhost:7545',
                            dataAddress: FlightSuretyData.address,
                            appAddress: FlightSuretyApp.address
                        }
                    }
                    fs.writeFileSync(__dirname + '/../src/dapp/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
                    fs.writeFileSync(__dirname + '/../src/server/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
                });
    });
}