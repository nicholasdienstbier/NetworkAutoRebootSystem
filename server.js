// server.js

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

deviceIP1 = "http://xxx.xx.x.xxx" //address for first local device to ping
deviceIP2 = "http://xxx.xx.x.xxx" //address for second local devic to ping
websiteIp1 = "https://httpstat.us/200" //address for first website to ping
websiteIp2 = "https://api.apify.com/v2/browser-info" //address for second website to ping

const Gpio = require('onoff').Gpio;
const powerStrip = new Gpio(14,'out'); //pin to plug in the power strip

const fetch = require('node-fetch');

powerStrip.writeSync(0);


let isLooping = false; //whether or not to be checking if we need to reset in case of issue
let isOnline = false; //whether or not the internet is online
let isPower = false; //whether or not the power is on

let logs = []; //where all the Event Log items are stored


app.get('/', (req, res) => { //this is the default when you open the IP address
    res.sendFile(__dirname + '/index.html');
});

app.listen(port, () => { //just displays in the console that the server is running
    console.log(`Server listening at http://localhost:${port}`);
});

const bodyParser = require('body-parser');
app.use(bodyParser.json());

function addLog(logMessage) { //method used to add a log to the table
    let currentTime = new Date();
    let newLog = {
        timestamp: currentTime.toLocaleString(),
        message: logMessage
    };
    logs.unshift(newLog); //this is like .append but the opposite, it adds to the beginning of the list
}

app.get('isLooping', (req, res) => { //lets script.js know if it is looping or not
    res.json({value: isLooping});
});
app.post('/toggleLoop', (req, res) => { //toggles the looping
    isLooping = !isLooping;

    let logMessage = "Loop " + (isLooping ? "Started" : "Stopped");
    addLog(logMessage);

    res.json({status: 'success'});
});

app.get('/logs', (req, res) => { //gets the logs
    res.json(logs);
});


app.get('isOnline', (req, res) => { //lets script.js know if the internet is online or not
    res.json({value: isOnline});
});

app.get('isPower', (req, res) => { //lets script.js know if the power is on or not
    res.json({value: isPower});
});

app.get('/state', (req, res) => { //lets script.js know isLooping, isPower, and isOnline
    res.json({
        isLooping: isLooping,
        isPower: isPower,
        isOnline: isOnline
    });
});




const checkOnlineStatus = async () => { //checks if the internet is online by checking two seperate websites
    const checkOnlineStatus1 = async () => {
        try {
            const online = await fetch(websiteIp1);
            return online.ok
        } catch (err) {
            return false;
        }
    };

    const checkOnlineStatus2 = async () => {
        try {
            const online = await fetch(websiteIp2);
            return online.ok
        } catch (err) {
            return false;
        }
    };
    
    const first = await checkOnlineStatus1();
    const second = await checkOnlineStatus2();
    return (first || second);
};

const checkPowerStatus = async () => { //checks if power is online by checking two seperate devices which are expected to be on if powers on
    const checkFirstDevice = async () => {
        try {
            const response = await fetch(deviceIP1);
            return true;
        } catch (err) {
            return false;
        }
    };
    const checkSecondDevice = async () => {
        try {
            const response = await fetch(deviceIP2);
            return true;
        } catch (err) {
            return false;
        }
    };
    const firstDevice = await checkFirstDevice();
    const secondDevice = await checkSecondDevice();

    return (firstDevice || secondDevice);   
};

setInterval(async () => { //repeatedly checks if the internet and power are online every 10 seconds
    const resultOnline = await checkOnlineStatus();
    const resultPower = await checkPowerStatus();

    if(resultOnline != isOnline) { //only when it changes, do we add log
        isOnline = resultOnline;

        let logMessage = "Internet went " + (resultOnline ? "Online" : "Offline");
        addLog(logMessage);
    }
    if(resultPower != isPower) {
        isPower = resultPower;

        let logMessage = "Power went " + (resultPower ? "Online" : "Offline");
        addLog(logMessage);
    }
    
    }, 10000); //10 seconds

const resetRouter = async() => //resets the router, turns it off for 10 seconds, then turns it back on and checks if its fixed
{
    //just turns off power strip for 10 seconds, then on for 300 seconds, then checks if internets on and returns that result
    console.log("Restarting router...!"); 
    
    powerStrip.writeSync(1);
    console.log("Router turned off, waiting 10 seconds...");
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    powerStrip.writeSync(0);
    console.log("Router turned on, waiting 300 seconds...");
    
    await new Promise(resolve => setTimeout(resolve, 300000));
    
    const isOnlineTemp = await checkOnlineStatus();
    console.log("Internet status after reset: " + (isOnlineTemp ? "Online" : "Offline"));
    return isOnlineTemp
}

setInterval(async () => { //this is the logic for the reset loop
    if(isLooping) //only loop if looping... 
    {
        if(!isOnline) //if internet is offline, check if power is online
        {
            if(isPower) //if power is online, reset router
            {
                isLooping = false; //stop loop to start with
                console.log("network offline and power online, rebooting network...");
                addLog("Network offline and power online, rebooting network...")
                successfulReset = await resetRouter();
                if(successfulReset) //resetRouter returns if internet is back online or not
                {
                    //reboot succesful, log, and turn loop back on
                    addLog("Network rebooted succesfully, internet back on!");
                    console.log("network rebooted succesfully, internet back on!");
                    isOnline = true;
                    isLooping = false;
                    delayLoopStart();
                }
                else
                {
                    //reboot unsuccesful, log, and turn loop off
                    addLog("Network reboot faipowerStrip, pausing loop until human input...");
                    console.log("network reboot faipowerStrip, pausing loop until human input...");
                    isLooping = false;
                }
            }
        }
    }
}, 1000);


const delayLoopStart = async () => { //waits an hour to turn the restart loop back on
    setTimeout(() => {
        isLooping = true;
        console.log("Loop started again after delay from succesful reset"); 
    }, 1000*60*60); //1 hour
};