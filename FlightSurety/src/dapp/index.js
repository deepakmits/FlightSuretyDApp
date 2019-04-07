
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async() => {

    let contract = new Contract('localhost', () => {


        // Read transaction
        contract.isOperational((error, result) => {
            console.log(error,result);
            console.log(contract.airlines);
            let selectFlight = DOM.elid('select-flight');
            contract.airlines.forEach(flight => {
                addFlightOptions(flight, selectFlight);
            });
            displayOperational('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
            
        });
    

        // User-submitted transactions
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let selectedFlightElement = document.getElementById("select-flight");
            let selectedFlightValue = selectedFlightElement.options[selectedFlightElement.selectedIndex].value;
            if(selectedFlightValue === "Select") {
                alert("Please select the flight");
            }else {
                DOM.elid('select-flight').value = "Select";
                selectedFlightValue = JSON.parse(selectedFlightValue);
                // Write transaction
                contract.fetchFlightStatus(selectedFlightValue, (error, result) => {
                    displayInsurance('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
                });
            }
        })


        DOM.elid('buy-insurance').addEventListener('click', () => {
            let selectedFlightElement = document.getElementById("select-flight");
            let selectedFlightValue = selectedFlightElement.options[selectedFlightElement.selectedIndex].value;
            let insuranceAmount = DOM.elid('insurance-amount').value;
            if(selectedFlightValue === "Select") {
                alert("Please select the flight");
            } else {
                DOM.elid('insurance-amount').value = "";
                selectedFlightValue = JSON.parse(selectedFlightValue);
                contract.buyInsurance(selectedFlightValue, insuranceAmount, (error, result) => {
                    if(error) {
                        alert(error);
                    }else{
                        displayInsurance('Buy Insurance', 'Insurance purchased by the passenger', 
                        [ { label: 'Insurance amount paid', error: error, value: `Insurance purchased by ${result.passenger} 
                        for ${result.insuranceAmount} ETH for flight ${result.flight} of ${result.airline} airline at 
                        ${new Date(result.timestamp * 1000)}`} ]);
                    }
                });
            }
        })


        DOM.elid('current-credit').addEventListener('click', () => {
            contract.getCurrentCredit((error, result) => {
                console.log(result.balance);
                displayCredits('Current Credit Check', 'Current Balance', [ { label: 'Current Balance Amount', error: error, value: `${result} ether at ${new Date()}`} ]);      
            });
        })


        DOM.elid('wallet-balance').addEventListener('click', () => {
            contract.getCurrentWalletBalance((error, result) => {
                displayCredits('Wallet Balance Check', 'Wallet Balance', [ { label: 'Wallet Balance Amount', error: error, value: `${result} ether at ${new Date()}`} ]);          
            });
        })


        DOM.elid('withdraw-credit').addEventListener('click', () => {
            contract.withdrawCredit((error, result) => {
                displayCredits('Credit Withdrawal', 'Credit Withdrawn Successful', [ { label: 'Check your wallet balances', error: error, value: `at ${new Date()}`} ]);          
            });
        })

        //airline, flight, timestamp, statusCode
        contract.flightSuretyApp.events.FlightStatusInfo({
            fromBlock: "latest"
        }, function (error, result) {
            if (error) {
                console.log(error)
            } else {
                displayInsurance('Flight Status', 'Flight Status Info ', [ { label: 'Flight Status', error: error, value: 
                `Airline : ${result.returnValues.airline} Flight : ${result.returnValues.flight} 
                Timestamp :  ${result.returnValues.timestamp} STATUS :  ${result.returnValues.status} at ${new Date()}`} ]);
            }
        });


        //airline, flight, timestamp, statusCode
        contract.flightSuretyApp.events.CreditDone({
            fromBlock: "latest"
        }, function (error, result) {
            if (error) {
                console.log(error)
            } else {
                displayInsurance('Auto Credit Check', 'Auto Credit Done for Status 20', [ { label: 'Flight Details', error: error, value: 
                `Airline : ${result.returnValues.airline} Flight : ${result.returnValues.flight} 
                Timestamp :  ${result.returnValues.timestamp}  at ${new Date()}`} ]);
            }
        });


        //airline, flight, timestamp, statusCode
        contract.flightSuretyApp.events.WithdrawSuccessful({
            fromBlock: "latest"
        }, function (error, result) {
            if (error) {
                console.log(error)
            } else {
                displayCredits('Credit Withdrawal', 'Credit Withdrawn Successful', [ { label: 'Check your wallet balances', error: error, value: `at ${new Date()}`} ]);
            }
        });
    
    });
    

})();


function addFlightOptions(flight, selectComponent) {
    let option = document.createElement("option");
    option.text =  `${flight.flight} at ${flight.time}`;
    option.value = JSON.stringify(flight);
    selectComponent.add(option);
}

function displayInsurance(title, description, results) {
    let displayDiv = DOM.elid("display-insurance");
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.removeChild(displayDiv.firstChild);
    displayDiv.append(section);

}

function displayOperational(title, description, results) {
    let displayDiv = DOM.elid("display-operational");
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);

}

function displayCredits(title, description, results) {
    let displayDiv = DOM.elid("display-credits");
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.removeChild(displayDiv.firstChild);
    displayDiv.append(section);

}










