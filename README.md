# AttendanceMonitor-Barrett-Thesis-Prezenta

# Setting up Project to local machine #

1. Install XAMPP package from https://www.apachefriends.org/download.html,
   When install is complete,
2. Open the XAMPP manager application, and run MySQL Database, Apache Web Server, and PROFTPD.
   When all the three servers are running, click on "Go To Application" (MAC OSX) or Load "http://localhost" (Windows), and click on "phpMyAdmin" in the top right-corner
3. Add a new database titled "AttendanceMonitor", and choose its collation to be "ascii_general_ci"
4. Import file from folder "Database Import" into the newly created database to generate tables for the app.
5. Unzip file php.zip from folder "Web App" to local machine
6. On the XAMPP manager application, click "Open Application Folder" (Mac) or "Explorer" (Windows)
7. Locate folder "htdocs", copy the extracted "php" folder from step 5 to the "htdocs" folder.
8. Load http://localhost/php/Prezenta/public/ in a browser on your machine to start the web application.

# Using the System #

1. Start the XAMPP manager application, and make sure to start the three servers: MySQL Database, Apache Web Server, and PROFTPD.
2.Load web application by loading http://localhost/php/Prezenta/public/ in your browser
3. Log in the web app and go select the class for which you are recording attendance.
4. Click the "Start Session" button
5. Switch on the device
6. Connect the FTDI Cable from the device to your computer
7. Run the "JavaTool" jar on your local machine
8. Click "Connect" on the java application to start students check-in

**Note:**
   For **Windows Users** make sure to select the right port for your FTDI cable in the java application.
   
 Once all students have checked in,
9. Go back to the web app, and click "End session"
10. Close the java application
11. Switch off, and unplug the device.



*Last Revised: August 20, 2018* 
