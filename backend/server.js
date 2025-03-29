const express = require('express'); // web framework for Node.js to build APIs and server-side applications
const bodyParser = require('body-parser'); // parse incoming JSON request
const cors = require('cors'); // middleware to enable CORS with various options

// MonjoDB client to connect and interact with the database
const {MongoClient, ObjectId} = require('mongodb');
const url = 'mongodb+srv://root:WhatAPassword@test.2svvr.mongodb.net/?retryWrites=true&w=majority&appName=Test';
const client = new MongoClient(url);
client.connect(); // establishes a connection
const db = client.db('COP4331');

// Initializes the express application.
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
    // incoming: login, password
    // outgoing: id, name, emailAddress, error

    // Default return values
    var error = '';
    var status = 200;
    var id = -1;
    var name = '';
    var email = '';

    // Gets input login and password from request
    const { login, password } = req.body;

    try {
        // Checks DB for User with matching login and password
        var results = await db.collection('Users').find({login:login, password:password}).toArray();

        // If match found
        if(results.length > 0)
        {
            id = results[0]._id;
            name = results[0].name;
            email = results[0].emailAddress;
        }
        else
        {
            // Checks DB again, incase login is an email
            results = await db.collection('Users').findOne({emailAddress:login, password:password});
            if(results)
            {
                id = results._id;
                name = results.name;
                emailAddress = login;
            }
            // No user with matching credentials
            else
            {
                error = 'Invalid Login/Password';
                status = 400;
            }
        }
    }
    catch (err) {
        error = 'Server Failure';
        status = 500;
    }

    // Returns login results
    var ret = {id:id, name:name, emailAddress:emailAddress, error:error};
    res.status(status).json(ret);
});

app.post('/api/register', async (req, res, next) => {
    // incoming: login, password, name, emailAddress
    // outgoing: error

    // Default return values, user successfully created
    var error = '';
    var status = 201;

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
            await db.collection('Users').insertOne(req.body);
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

    // Creates formatted id from req
    const id = ObjectId.createFromHexString(req.body.id);

    try {
        // Finds user through id, returns 404 status if not found
        var curInfo = await db.collection('Users').findOne({_id:id});
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
            error = 'User Not Found';
            status = 404;
        }
    }
    catch (err) {
        error = 'Server Failure';
        status = 500;
    }

    // Returns update results
    var ret = { id: id, login: login, name: name, emailAddress: emailAddress, error: error};
    res.status(status).json(ret);
});

app.post('/api/getAnimeInfo', async (req, res, next) => {
    // incoming: animeId
    // outgoing: data: {...}, error

    // Default values
    var data = {}
    var error = '';
    var status = 200;

    // Checks that animeId is number above 0, error otherwise
    if(req.body.animeId && !isNaN(req.body.animeId) && req.body.animeId > 0)
    {
        // URL for Jikan API request
        const jikan_url = 'https://api.jikan.moe/v4/anime/' + req.body.animeId + '/full';

        // HTTP request, output stored in data
        try {
            const response = await fetch(jikan_url);
            
            if(!response.ok)
            {
                status = response.status;
                error = 'Anime Not Found';
            }
            else
            {
                var out = await response.json();
                data = out.data;
            }

        }
        catch (err) {
            status = 500;
            error = 'Server Failure';
        }
    }
    else
    {
        status = 400;
        error = 'Invalid Anime ID';
    }
    
    // Returns anime data
    var ret = {data:data, error:error}
    res.status(status).json(ret);
});

app.post('/api/searchAnime', async (req, res, next) => {
    // incoming: searchParams: {...}
    // outgoing: pagination: {...}, data: [{...}, ...], error

    // Default values
    var data = {};
    var pagination = {};
    var error = '';
    var status = 200;

    // Base search url
    var jikan_url = 'https://api.jikan.moe/v4/anime?&sfw=true';
    const params = req.body.searchParams;

    // Concats params to url, if given
    if(params)
    {
        if(params.q)
        {
            jikan_url = jikan_url + '&q=' + params.q;
        }
        if(params.type)
        {
            jikan_url = jikan_url + '&type=' + params.type;
        }
        if(params.minScore)
        {
            jikan_url = jikan_url + '&min_score=' + params.minScore;
        }
        if(params.maxScore)
        {
            jikan_url = jikan_url + '&max_score=' + params.maxScore;
        }
        if(params.status)
        {
            jikan_url = jikan_url + '&status=' + params.status;
        }
        if(params.page)
        {
            jikan_url = jikan_url + '&page=' + params.page;
        }
    }
    
    // HTTP request
    try {
        const response = await fetch(jikan_url);
            
        if(!response.ok)
        {
            status = response.status;
            error = 'Invalid Query Parameters';
        }
        else
        {
            var out = await response.json();
            data = out.data;
            pagination = out.pagination;
        }
    }
    catch (err) {
        error = 'Server Failure';
        status = 500;
    }

    // Returns search results
    var ret = {pagination:pagination, data:data, error:error};
    res.status(status).json(ret);
});

app.post('/api/addAlert', async (req, res, next) => {
    // incoming: id, animeId
    // outgoing: error

    // Default values
    const {id, animeId} = req.body;
    var error = '';
    var status = 200;

    try {

        const _id = ObjectId.createFromHexString(id);
        // Checks that id corresponds to existing user
        var curInfo = await db.collection('Users').findOne({_id:_id})
        if(!curInfo)
        {
            res.status(404).json({error:'User Not Found'});
            return;
        }

        // Checks that animeId is a number
        if(isNaN(animeId))
        {
            res.status(400).json({error:'Invalid Anime ID'});
            return;
        }

        // Checks that animeId corresponds to existing anime
        const jikan_url = 'https://api.jikan.moe/v4/anime/' + req.body.animeId + '/full';
        const response = await fetch(jikan_url);
        if(!response.ok)
        {
            res = response;
            return;
        }

        // Adds animeId to alerts array if not already present
        if(!curInfo.alerts)
        {
            curInfo['alerts'] = [animeId]
        }
        else if(!curInfo['alerts'].includes(animeId))
        {
            curInfo['alerts'].push(animeId);
        }

        // Returns new alerts section to db
        await db.collection('Users').updateOne({_id:_id}, {$set: {alerts:curInfo.alerts}});

        // Updates alerts section of anime in Anime collection, adds anime if missing
        var animeDB = await db.collection('Anime').findOne({animeId:animeId})
        if(!animeDB)
        {
            // Creates new JSON for anime
            const animeInfo = await response.json();
            const animeObject = {
                animeId: animeId,
                name: animeInfo.data.title,
                airing: animeInfo.data.airing,
                air_day: animeInfo.data.broadcast.day,
                air_time: animeInfo.data.broadcast.time,
                alerts: [id]
            }

            // Adds anime to Anime collection
            await db.collection('Anime').insertOne(animeObject);
        }
        else
        {
            // Adds userId to alerts
            if(!animeDB.alerts)
            {
                animeDB['alerts'] = [id];
            }
            else if(!animeDB['alerts'].includes(id))
            {
                animeDB['alerts'].push(id);
            }

            // Updates alerts section to db
            await db.collection('Anime').updateOne({animeId:animeId}, {$set: {alerts:animeDB.alerts}});
        }
    }
    catch (err) {
        error = 'Server Failure';
        status = 500;
    }

    // Returns results
    var ret = {error:error};
    res.status(status).json(ret);
});

// Starts the Express server and listens on port 5000 for incoming request
app.listen(5000);
