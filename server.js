const express = require('express'); // web framework for Node.js to build APIs and server-side applications
const bodyParser = require('body-parser'); // parse incoming JSON request
const cors = require('cors');

// MonjoDB client to connect and interact with the database
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb+srv://root:WhatAPassword@test.2svvr.mongodb.net/?retryWrites=true&w=majority&appName=Test';
const client = new MongoClient(url);
client.connect();

// Initializes the express application
const app = express();
app.use(cors()); // allow request from any origin
app.use(bodyParser.json()); //allows the server to accept and parse incoming JSON data

// CORS HEADER
// Ensures that all incoming request are allowed regardless of origin
// Specifies allowed request headers and methods
// next() moves to the next middleware or route handler
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE, OPTIONS');
    next();
}
);

// handles user login, defining a post API route /api/login
app.post('/api/login', async (req, res, next) => {

    // Default return values
    var error = '';
    var status = 200;
    var id = -1;
    var name = '';
    var email = '';

    // extract login and password info, from req.body
    // sent by the client, by login
    const { login, password } = req.body;

    // Selects the COP4331 database for operation
    const db = client.db('COP4331');

    try {
        // queries the user collection in the database to find document where both login, password match input
        const results = await db.collection('Users').find({login:login, password:password}).toArray();

        // if result has at least one match, it means login was successful
        if( results.length > 0 )
        {
            id = results[0]._id;
            name = results[0].name;
            email = results[0].emailAddress;
        }
        else
        {
            error = 'Invalid Login/Password';
            status = 401;
        }
    }
    catch (err) {
        error = 'Server Failure';
        status = 400;
    }

    // Returns login results
    var ret = { id: id, name: name, emailAdress: email, error: error};
    res.status(status).json(ret);
});

app.post('/api/register', async (req, res, next) => {
    // incoming: login, password, name, emailAddress
    // outgoing: error

    // Default return values, user successfully created
    var error = '';
    var status = 201;

    // Selects the COP4331 database for operation
    const db = client.db('COP4331');

    try {
        // Attempts to insert input user info into Users collection

        var loginCheck = await db.collection('Users').find({login:req.body.login}).toArray();
        var emailCheck = await db.collection('Users').find({emailAddress:req.body.emailAddress}).toArray();
        if(loginCheck.length > 0)
        {
            error = 'Login Already In Use';
            status = 401;
        }
        else if(emailCheck.length > 0)
        {
            error = 'Email Address Already In Use';
            status = 401;
        }
        else 
        {
            results = await db.collection('Users').insertOne(req.body);
        }
    }
    // Error caught, bad request
    catch (err) {
        error = 'Server Failure';
        status = 400;
    }
    
    // Returns register results
    var ret = { error: error };
    res.status(status).json(ret);
});

// Starts the Express server and listens on port 5000 for incoming request
app.listen(5000);
