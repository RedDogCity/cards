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

    // initialize an empty string for the error message. 
    // will remain empty if no error occurs
    var error = '';
    // extract login and password info, from req.body
    // sent by the client, by login
    const { login, password } = req.body;

    // Access MongoDB database name COP4331, using the connected client object
    const db = client.db('COP4331');

    // queries the user collection in the database to find document where both login, password match input
    const results = await db.collection('Users').find({login:login, password:password}).toArray();

    // set the default values for the response in case the login fails
    var id = -1;
    var name = '';
    var email = '';

    // if result has at least one match, it means login was successful
    if( results.length > 0 )
    {
        id = results[0]._id;
        name = results[0].name;
        email = results[0].emailAddress;
    }
    // if (results.length === 0) {
    //     return res.status(401).json({ error: 'Invalid login credentials' });
    // }
    // gives re, user ud, name, emailAddress, error
    // sents a json response back to the client with a 200 (ok) status
    var ret = { id: id, name: name, emailAdress: email, error: error};
    res.status(200).json(ret);
});

app.post('/api/register', async (req, res, next) => {
    // incoming: login, password, name, emailAddress
    // outgoing: error

    var error = '';

    // inset the entire body into User collectoin
    const db = client.db('COP4331');
    const results = await db.collection('Users').insertOne(req.body);

    // returns and empty error message.
    var ret = { error: error };
    res.status(200).json(ret);
});
// Starts the Express server and listens on port 5000 for incoming request
app.listen(5000);
