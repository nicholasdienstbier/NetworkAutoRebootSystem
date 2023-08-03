Network Auto Reboot System (NARS) - Nicholas Dienstbier

This is a project I developed to reduce the amount of manual resetting done by the IT team at a company in case of any network outage.
The program constantly monitors both the network outside connectivity, as well as the power, to reset the router in case of an issue.
It provides a web-hosted front end interface, where users can see current status, as well as a log of outages, and resets.
The user can also control if the program is actively looking for outages, in case they want to work on the network without it shutting off.

------------------------------------------------------------------------------------------------------------------------------------------

Setup Guide:

1. Ensure the Pi is connected to the internet via Ethernet or Wi-Fi.

2. Install Node.js:
 - Open a terminal window.
 - Update the package list by typing sudo apt update and pressing Enter.
 - Install Node.js by typing sudo apt install nodejs and pressing Enter.
   - Verify the installation by typing node -v. The version of Node.js should be displayed.

3. Install npm (Node Package Manager):
 - In the terminal window, type sudo apt install npm and press Enter.
   - Verify the installation by typing npm -v. The version of npm should be displayed.

4. Download and Set Up the NARS Project:
 - Transfer the NARS project to the RPi. You can use a USB stick, or download it directly if it's accessible online.
 - Extract the project files.
 - Navigate to the project directory in the terminal (e.g., cd /path/to/NARSv5).

5. Install the NARS Project Dependencies:
 - In the terminal, within the project directory, type npm install and press Enter. This will install all the dependencies specified in the package.json file.

6. Configure/customize the system:
 - Connect the power strip to the RPi using the appropriate GPIO pins. (this is the one I used) https://www.adafruit.com/product/2935?gclid=Cj0KCQjwoK2mBhDzARIsADGbjeq1qwPL-SdZYLoj7PjKgFTOT1ljIwvjqw8jBBwMhMmhz0i0dXHaN3kaAnJnEALw_wcB
 - Update the server.js file with the correct GPIO pins, if necessary.
 - Update the address of the local printers/devices which are used to check for power status

7. Run the NARS Application:
 - In the terminal, within the project directory, type node server.js and press Enter. This will start the NARS application.
 - Open a web browser on the RPi and navigate to http://localhost:3000 to view the application interface.



Auto-Start the NARS Application on Boot (optional):

If you want the NARS application to start automatically when the RPi boots up, you'll need to edit the /etc/rc.local file:
 - In the terminal, type sudo nano /etc/rc.local and press Enter.
 - Before the line that says exit 0, add the following line (replace /path/to/ with the actual path to your server.js file): (cd /path/to/NARSv5 && node server.js) &
 - Press Ctrl+X, then Y, then Enter to save and exit.
 - Reboot the RPi. The NARS application should start automatically.