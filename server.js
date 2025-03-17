const express = require('express'); // web framework for Node.js to build APIs and server-side applications
const bodyParser = require('body-parser'); // parse incoming JSON request
const cors = require('cors');

// MonjoDB client to connect and interact with the database
const {MongoClient, ObjectId} = require('mongodb');
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
            status = 400;
        }
    }
    catch (err) {
        error = 'Server Failure';
        status = 500;
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
            status = 400;
        }
        else if(emailCheck.length > 0)
        {
            error = 'Email Address Already In Use';
            status = 400;
        }
        else 
        {
            results = await db.collection('Users').insertOne(req.body);
        }
    }
    // Error caught, bad request
    catch (err) {
        error = 'Server Failure';
        status = 500;
    }
    
    // Returns register results
    var ret = { error: error };
    res.status(status).json(ret);
});

app.post('/api/updateUser', async (req, res, next) => {
    // incoming: id, (one of following [login, password, emailAddress, name])
    // outgoing: id, login, emailAddress, name, error

    // Default values
    var error = '';
    var status = 200;
    var name = '';
    var emailAddress = '';
    var login = '';

    // Uses COP4331 database, creates formatted id from req
    const db = client.db('COP4331');
    const id = ObjectId.createFromHexString(req.body.id);

    try {
        // Finds user through id, returns 404 status if not found
        var curInfo = await db.collection('Users').findOne({_id:id})
        if(curInfo)
        {
            name = curInfo.name;
            emailAddress = curInfo.emailAddress;
            login = curInfo.login;

            // Checks for which key given, updates value on database
            if(req.body.login)
            {
                // Ensures login not duplicated, returns error if so
                var loginCheck = await db.collection('Users').find({login:req.body.login}).toArray();
                if(loginCheck.length > 0)
                {
                    error = 'Login Already In Use';
                    status = 400;
                }
                else
                {
                    db.collection('Users').updateOne({_id:id}, {$set: {login:req.body.login}});
                    login = req.body.login;
                }
            }
            else if(req.body.emailAddress)
            {
                // Ensures emailAddress not duplicated, returns error if so
                var loginCheck = await db.collection('Users').find({emailAddress:req.body.emailAddress}).toArray();
                if(loginCheck.length > 0)
                {
                    error = 'Email Address Already In Use';
                    status = 400;
                }
                else
                {
                    await db.collection('Users').updateOne({_id:id}, {$set: {emailAddress:req.body.emailAddress}});
                    emailAddress = req.body.emailAddress;
                }
            }
            else if(req.body.password)
            {
                await db.collection('Users').updateOne({_id:id}, {$set: {password:req.body.password}});
            }
            else if(req.body.name)
            {
                await db.collection('Users').updateOne({_id:id}, {$set: {name:req.body.name}});
                name = req.body.name;
            }
        }
        else 
        {
            error = 'Invalid User ID';
            status = 404;
        }
    }
    catch (err) {
        error = err;
        status = 500;
    }

    // Returns update results
    var ret = { id: id, login: login, name: name, emailAddress: emailAddress, error: error};
    res.status(status).json(ret);
});

// Starts the Express server and listens on port 5000 for incoming request
app.listen(5000);
