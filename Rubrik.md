# Project Rubrik - 

## Separation of Concerns, Operational Control and “Fail Fast”

Smart Contract code is separated into multiple contracts:

1) FlightSuretyData.sol for data persistence
2) FlightSuretyApp.sol for app logic and oracles code


A Dapp client has been created and is used for triggering contract calls. Client can be launched with “npm run dapp” and is available at http://localhost:8000

Specific contract calls:

1) Passenger can purchase insurance for flight
2) Trigger contract to request flight status update


A server app has been created for simulating oracle behavior. Server can be launched with “npm run server”

Students has implemented operational status control.

Contract functions “fail fast” by having a majority of “require()” calls at the beginning of function body


## Airlines 

First airline is registered when contract is deployed.

Only existing airline may register a new airline until there are at least four airlines registered

Demonstrated either with Truffle test or by making call from client Dapp

Registration of fifth and subsequent airlines requires multi-party consensus of 50% of registered airlines

Demonstrated either with Truffle test or by making call from client Dapp

Airline can be registered, but does not participate in contract until it submits funding of 10 ether

Demonstrated either with Truffle test or by making call from client Dapp

## Passengers

Passengers can choose from a fixed list of flight numbers and departure that are defined in the Dapp client

Passengers may pay up to 1 ether for purchasing flight insurance.

If flight is delayed due to airline fault, passenger receives credit of 1.5X the amount they paid

Passenger can withdraw any funds owed to them as a result of receiving credit for insurance payout

Insurance payouts are not sent directly to passenger’s wallet

## Oracles (Server App)

Oracle functionality is implemented in the server app.

Upon startup, 20+ oracles are registered and their assigned indexes are persisted in memory

Update flight status requests from client Dapp result in OracleRequest event emitted by Smart Contract that is captured by server (displays on console and handled in code)

Server will loop through all registered oracles, identify those oracles for which the OracleRequest event applies, and respond by calling into FlightSuretyApp contract with random status code of Unknown (0), On Time (10) or Late Airline (20), Late Weather (30), Late Technical (40), or Late Other (50)


