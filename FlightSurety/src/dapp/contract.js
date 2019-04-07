import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {
        //let config = Config['localhost'];
        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
        //let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
    }

    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {
           
            this.owner = accts[0];

            let counter = 1;

            let flights = [
                {
                    time: "10:00",
                    timestamp: Math.floor(Date.now() / 1000),
                    destination: "Delhi",
                    flight: "DEL1000",
                    airline: accts[counter++],
                    status:0
                },
                {
                    time: "11:00",
                    timestamp: Math.floor(Date.now() / 1000),
                    desination: "Mumbai",
                    flight: "MUM1100",
                    airline: accts[counter++],
                    status:0
                },
                {
                    time: "13:00",
                    timestamp: Math.floor(Date.now() / 1000),
                    desination: "Kolkata",
                    flight: "KOL1300",
                    airline: accts[counter++],
                    status:0
                },
                {
                    time: "14:00",
                    timestamp: Math.floor(Date.now() / 1000),
                    desination: "Nagpur",
                    flight: "NAG1400",
                    airline: accts[counter++],
                    status:0
                    },
                {
                    time: "15:00",
                    timestamp: Math.floor(Date.now() / 1000),
                    desination: "Chennai",
                    flight: "CHE1500",
                    airline: accts[counter++],
                    status:0
                }
                ];

                this.airlines=flights;

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }

            callback();
        });
    }

    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }

    fetchFlightStatus(flight, callback) {
        let self = this;
        let payload = {
            airline: flight.airline,
            flight: flight.flight,
            timestamp: flight.timestamp
        } 
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner}, (error, result) => {
                callback(error, payload);
            });
    }


    buyInsurance(flight, insuranceAmount, callback) {
        let self = this;
        self.flightSuretyApp.methods.registerFlight(flight.airline, flight.flight, flight.timestamp).send({
            from: self.passengers[0],
            value: self.web3.utils.toWei(insuranceAmount, "ether"),
            gas: 3722398,
            gasPrice: 100000000000
        }, (error, result) => {
            flight.insuranceAmount = insuranceAmount;
            flight.passenger = self.passengers[0];
            callback(error, flight);
        });
    }

    getCurrentCredit(callback) {
        let self = this;
        self.flightSuretyApp.methods.getInsureeBalance().call({
            from: self.passengers[0]
        }, (error, result) => {
            callback(error, result);
        });
    }

    getCurrentWalletBalance(callback) {
        let self = this;
        this.web3.eth.getBalance((self.passengers[0]),(error, result) => {
            result = web3.fromWei(result, 'ether');
            callback(error, result);
        });
    }


    withdrawCredit(callback) {
        let self = this;
        self.flightSuretyApp.methods.withdrawInsuranceAmount().call({
            from: self.passengers[0]
        }, (error, result) => {
            callback(error, result);
        });
    }
}