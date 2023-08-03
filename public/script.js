window.addEventListener('load', (event) => {
    //on load, does all of these things.
    updateTime();
    updateInfo();
    updateLogs();
    console.log('page is fully loaded');
});

let timeElem = document.getElementById('currentTime');
let networkElem = document.getElementById('internetStatus');
let powerElem = document.getElementById('powerStatus');
let toggleLoopButton = document.getElementById('toggleLoopButton');

let logTableBody = document.getElementById('eventLog'); //this lines sketchy i dont rfemember

toggleLoopButton.onclick = async function() {
    //the "Start/Stop Looping" button calls toggleLoop on server side, then updates immediately
    let response = await fetch('/toggleLoop', {method: 'POST'});
    updateInfo();
}

async function updateInfo() {
    try {
        let response = await fetch('/state'); //gets info of internet, loopstatus, etc.
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`); //if it doesnt work, throw error
        } else {
            let state = await response.json();
            // update page elements based on the state object
            networkElem.innerHTML = "Internet: <span class='" + (state.isOnline ? "online" : "offline") + "'>" + (state.isOnline ? "Online" : "Offline") + "</span>";
            powerElem.innerHTML = "Power: <span class='" + (state.isPower ? "online" : "offline") + "'>" + (state.isPower ? "On" : "Off") + "</span>";
            
            toggleLoopButton.innerHTML = (state.isLooping ? "Stop" : "Start") + " Looping";
        }
    } catch (error) {
        console.log('There was a problem with the fetch operation: ' + error.message);
    }
}

async function updateLogs() {
    //fetch logs from the server
    let response = await fetch('/logs');
    let logs = await response.json();

    //clear the current logs to prevent duplicates
    logTableBody.innerHTML = '';

    //add each log to the table
    for (let log of logs) {
        //create a new row and cells
        let row = document.createElement('tr');
        let timeCell = document.createElement('td');
        let eventCell = document.createElement('td');

        //fill the cells with log data
        timeCell.textContent = log.timestamp;
        eventCell.textContent = log.message;

        //add the cells to the row
        row.appendChild(timeCell);
        row.appendChild(eventCell);

        //add the row to the table
        logTableBody.appendChild(row);
    }
}

function updateTime()
{
    //update time on website nicely formatted
    let currentTime = new Date(); 
    timeElem.innerHTML = "Time: " + currentTime.getHours()%12 + ":" + currentTime.getMinutes().toString().padStart(2,"0") + ":" + currentTime.getSeconds().toString().padStart(2,"0") + (currentTime.getHours() > 12 ? " PM" : " AM");
}

setInterval(updateTime, 1000); //update time every second
setInterval(async function() {
    updateInfo(); //update statuses, and logs every second
    updateLogs();
}, 1000);