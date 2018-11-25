# LinuxMonitor
A web-based linux monitor with WebSocket

# LinuxMonitor
LinuxMonitor is a web-based Linux monitoring application. (_This application is developed as Gatech CS6235 class project._)
* Multi-target monitoring. Allow monitoring multiple targets at the same time. Good at today's cloud environments.
* Real-time monitoring. Utilize `WebSocket` as the communication bridge between the frontend and backend. It allows a real-time monitoring with less network traffic and other performance costs.


## How to use
LinuxMonitor involves three parts
* Frontend User Interface
* Central Server
* Backend Metrics Report

The `Frontend User Interface`, which can be accessed at `http://monitor.sousys.com`, is a web application that allows users to manage and monitor target machines. Go to `http://monitor.sousys.com`, you will need to register an account in order to use this application. Currently, the website is hosted without HTTPS enabling, so your browser may warn you about this issue. If you worry about security, I provide a public account `username: test123`, `password: Hello12345` for you to explore this application. Once login, go to the `Target` page to add your targets.

The `Central Server` is the server that stores all user's information and manages websocket. As a user, you don't need to care about this part.

You will need to download and run the `Backend Metrics Report` at the Linux machines that you want to monitor. The backend is developed with Node.js so make sure Node.js is installed before doing the following. Moreover, you will need to modify the username and password in the `backend/user_secret.js` file if you want to use your own account. 
   
    git clone https://github.com/Nan0416/LinuxMonitor.git
    cd backend
    npm install -s
    node index.js --name TARGET_NAME --port PORT_NUMBER
The `TARGET_NAME` and `PORT_NUMBER` must be same as you specify at the web panel.

Modify the username and password in order to use your own account.

    #backend/user_secret.js example
    const username = "test123";
    const password = "Hello12345"


## Architecture
![](https://github.com/Nan0416/LinuxMonitor/blob/master/architecture.png?raw=true)

When a user goes to the frontend webpage, a websocket will be established. The websocket is used by the central server to notify the state change of any monitored targets. For example, when a backend target starts running, it will first report to the central server. And then the central server will use the WebSocket to notify the user.

The browser directly communicates with the backend targets, so each target should have a public IP. If your target machine cannot access a public IP, one solution is to configure your router's NAT.
