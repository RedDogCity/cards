const express = require('express'); // web framework for Node.js to build APIs and server-side applications
const bodyParser = require('body-parser'); // parse incoming JSON request
const cors = require('cors'); // middleware to enable CORS with various options
const nodemailer = require('nodemailer');

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

// Configuring nodemailer
const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 465,
    secure: true,
    auth: {
        user: 'cop4331c@zohomail.com', // Replace with your email
        pass: 'J86xxq9q0gsx'  // Replace with your email password or app-specific password
    }
});

// Endpoint to send verification code
app.post('/api/sendVerificationCode', async (req, res) => {
    const { email } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit code
    const expiration = Date.now() + 15 * 60 * 1000; // Code expires in 15 minutes

    try {
        // Store the code and expiration in the database
        await db.collection('EmailVerification').updateOne(
            { email },
            { $set: { code, expiration } },
            { upsert: true }
        );

        // Send the email
        const mailOptions = {
            from: 'cop4331c@zohomail.com',
            to: email,
            subject: 'Your Verification Code',
            text: `Your verification code is: ${code}`
        };
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Verification code sent successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to send verification code.' + err });
    }
});

// Endpoint to verify the code
app.post('/api/verifyCode', async (req, res) => {
    const { email, code } = req.body;

    try {
        const record = await db.collection('EmailVerification').findOne({ email });

        if (record) {
            if (record.code === parseInt(code) && record.expiration > Date.now()) {
                // Code is valid
                await db.collection('Users').updateOne({ email }, {$set: { isEmailverified:true }});
                await db.collection('EmailVerification').deleteOne({ email }); // Remove the record after verification
                res.status(200).json({ message: 'Email verified successfully.' });
            } else {
                res.status(400).json({ error: 'Invalid or expired code.' });
            }
        } else {
            res.status(404).json({ error: 'No verification code found for this email.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to verify code.' });
    }
});

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
        // returns an array
        var results = await db.collection('Users').find({login:login, password:password, isEmailverified:true}).toArray();

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
            // Now result is an object, and not an array.
            results = await db.collection('Users').findOne({emailAddress:login, password:password});
            if(results)
            {
                id = results._id;
                name = results.name;
                email = results.emailAddress; // problem line
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
    var ret = { id: id, name: name || '', emailAddress: email || '', error: error };
    res.status(status).json(ret);
});

app.post('/api/forgotPassword', async (req, res) => {
    const { email } = req.body;

    try {
        // Check if the email exists and is verified in the database
        const user = await db.collection('Users').findOne({ emailAddress: email, isEmailverified: true });

        if (!user) {
            return res.status(404).json({ error: 'Email not recognized or not verified.' });
        }

        // Ensure the password field exists
        if (!user.password) {
            return res.status(500).json({ error: 'Password is missing in the database.' });
        }

        // Send the password to the user's email
        const mailOptions = {
            from: 'cop4331c@zohomail.com',
            to: email,
            subject: 'Your Account Password',
            text: `Hello ${user.name},\n\nYour account password is: ${user.password}\n\nBest regards,\nAni-Lert`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Password sent to your email.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to process your request.' });
    }
});

app.post('/api/register', async (req, res, next) => {
    // incoming: login, password, name, emailAddress
    // outgoing: error

    // Default return values
    let error = '';
    let status = 201;

    // Construct user object
    const user = {
        login: req.body.login,
        password: req.body.password,
        emailAddress: req.body.emailAddress,
        name: req.body.name,
        isEmailverified: true,
        alerts: []
    };

    // Password complexity validation
    const minLength = 8;
    const hasNumberOrSpecialChar = /[0-9!@#$%^&*]/;

    try {
        if (user.password.length < minLength) {
            error = 'Password must be at least 8 characters long.';
            status = 400;
        } else if (!hasNumberOrSpecialChar.test(user.password)) {
            error = 'Password must have at least one number or special character.';
            status = 400;
        } else {
            // Check if login or email already exists in the database
            const loginCheck = await db.collection('Users').find({ login: req.body.login }).toArray();
            const emailCheck = await db.collection('Users').find({ emailAddress: req.body.emailAddress }).toArray();

            if (loginCheck.length > 0) {
                error = 'Login Already In Use';
                status = 400;
            } else if (emailCheck.length > 0) {
                error = 'Email Address Already In Use';
                status = 400;
            } else {
                // Insert user into the database
                await db.collection('Users').insertOne(user);
            }
        }
    } catch (err) {
        // Handle server errors
        error = 'Server Failure';
        status = 500;
    }

    // Return response
    const ret = { error: error };
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

// Searches for anime by name and filters
app.post('/api/searchAnime', async (req, res, next) => {
    // incoming: searchParams: {...}
    // outgoing: pagination: {...}, data: [{...}, ...], error

    // Default values
    var animeData = [];
    var pagination = {};
    var error = '';
    var status = 200;

    // Base search url
    var jikan_url = 'https://api.jikan.moe/v4/anime?&sfw=true';
    const params = req.body.searchParams;

    // Concats params to url, if given
    if(params)
    {
        // Query: search term
        if(params.q)
        {
            jikan_url = jikan_url + '&q=' + params.q;
        }
        // Media type:TV, Movie, etc.
        if(params.type)
        {
            jikan_url = jikan_url + '&type=' + params.type;
        }
        // Minimum score: lowest searched for score on MAL
        if(params.minScore)
        {
            jikan_url = jikan_url + '&min_score=' + params.minScore;
        }
        // Maximum score: highest searched for score on MAL
        if(params.maxScore)
        {
            jikan_url = jikan_url + '&max_score=' + params.maxScore;
        }
        // Airing status: currently being broadcasted
        if(params.status)
        {
            jikan_url = jikan_url + '&status=' + params.status;
        }
        // Page: Page number if search results > 25 anime
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
            out.data.forEach(anime => {
                animeData.push({
                    animeId: anime.mal_id,
                    title: anime.title,
                    airing: anime.airing,
                    air_day: anime.broadcast.day,
                    synopsis: anime.synopsis,
                    imageURL: anime.images.jpg.image_url
                });
            });
            pagination = out.pagination;
        }
    }
    catch (err) {
        error = 'Server Failure';
        status = 500;
    }

    // Returns search results
    var ret = {pagination:pagination, data:animeData, error:error};
    res.status(status).json(ret);
});

// Adds anime alert for user
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
            res.status(404).json({error:'Anime not found'});
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
                title: animeInfo.data.title,
                airing: animeInfo.data.airing,
                air_day: animeInfo.data.broadcast.day,
                synopsis: animeInfo.data.synopsis,
                imageURL: animeInfo.data.images.jpg.image_url,
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

app.post('/api/removeAlert', async (req, res, next) => {
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

        // Removes animeId to alerts array if present
        let index = curInfo.alerts.indexOf(animeId)
        if(index != -1) 
        {
            curInfo.alerts.splice(index, 1)

            // Returns new alerts section to db
            await db.collection('Users').updateOne({_id:_id}, {$set: {alerts:curInfo.alerts}});            
        }

        // Updates alerts section of anime in Anime, removes anime from DB if no alerts
        var animeDB = await db.collection('Anime').findOne({animeId:animeId})
        if(animeDB) 
        {
            // Removes userId from anime alerts, if present
            let index = animeDB.alerts.indexOf(id)
            if(index != -1)
            {
                animeDB.alerts.splice(index, 1)

                // Updates alerts section to db
                await db.collection('Anime').updateOne({animeId:animeId}, {$set: {alerts:animeDB.alerts}});
            }

            // Removes anime from DB if alerts empty
            if(animeDB.alerts.length == 0)
            {
                await db.collection('Anime').deleteOne({animeId: animeId})
            }
        }
    }
    catch (error)
    {
        error = 'Server Failure';
        status = 500;
    }

    var ret = {error: error}
    res.status(status).json(ret)
});

// Fetches all anime currently on user's alerts list
app.post('/api/getAnimeAlerts', async (req, res, next) => {
    // incoming: id
    // outgoing: anime: [{animeId, title, imageURL, synopsis, etc.}, ...], error

    const id = req.body.id;
    var error = '';
    var status = 200;

    try {
        // Checks that id is from valid user
        const _id = ObjectId.createFromHexString(id);
        var user = await db.collection('Users').findOne({_id:_id})
        if(!user)
        {
            res.status(404).json({error:'User Not Found'});
            return;
        }

        // Gets all anime from alerts list, error if any missing
        var anime = await db.collection('Anime').find({alerts: id}).toArray()
        if(anime.length != user.alerts.length){
            return res.status(404).json({error: 'Alert not found in DB'})
        }
    }
    catch(err) {
        error = 'Server Failure';
        status = 500;
    }

    res.status(status).json({anime: anime, error: error});
});

// Sends out alert emails to every user with updated anime on their list
app.post('/api/sendAlerts', async (req, res, next) => {
    // incoming: day
    // outgoing: error

    const day = req.body.day
    var error = '';
    var status = 200;

    try {
        // Gets list of anime with new episode aired yesterday
        var alertsArr = await db.collection("Anime").find({airing: true, air_day: day}).toArray()

        // If any anime with new episode
        if(alertsArr.length > 0) {
            var userArr = []

            // Puts all userIds and related anime titles into userArr
            // Format: userArr = [{userId, [anime, ...]}, ...]
            for(i = 0; i < alertsArr.length; i += 1) {
                for(j = 0; j < alertsArr[i].alerts.length; j += 1) {

                    // Checks if userId already in userArr
                    var index = userArr.find(e => e.id === alertsArr[i].alerts[j])
                    // If not found, create new entry in userArr for userId + anime
                    if(index == undefined) {
                        var obj = {
                            id: alertsArr[i].alerts[j],
                            anime: [alertsArr[i].title],
                        }
                        userArr.push(obj)
                    }
                    // If found, append anime title to user obj
                    else {
                        userArr[index].anime.push(alertsArr[i].title)
                    }
                }
            }

            // Goes over every user
            for(i = 0; i < userArr.length; i += 1) {
                // Fetches user info from DB
                const _id = ObjectId.createFromHexString(userArr[i].id)
                const userData = await db.collection("Users").findOne({_id: _id})
                if(!userData) {
                    return res.status(500).json({error: 'DB Error'})
                }

                // Creates single string of all alerted anime titles for user
                var animeString = ''
                for(j = 0; j < userArr[i].anime.length; j += 1) {
                    animeString = animeString + userArr[i].anime[j] + '\n'
                }

                // Formats email
                const mailOptions = {
                    from: 'cop4331c@zohomail.com',
                    to: userData.emailAddress,
                    subject: 'Your Alerts for the Day',
                    text: `Hello ${userData.name},\n\nThe following anime on your list have a new episode!\n\n` + animeString
                }

                await transporter.sendMail(mailOptions)
            }
        }
    }
    catch (err) {
        error = 'Server Failure'
        status = 500
    }

    ret = {error:error}
    res.status(status).json(ret)
});

// Returns current top anime
app.post('/api/getTopAnime', async (req, res, next) => {
    // incoming: nothing
    // outgoing: pagination: {...}, data: [{...}, ...], error

    // Default values
    var animeData = [];
    var error = '';
    var status = 200;

    // Base search url
    const jikan_url = 'https://api.jikan.moe/v4/top/anime';
    
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
            out.data.forEach(anime => {
                animeData.push({
                    animeId: anime.mal_id,
                    title: anime.title,
                    airing: anime.airing,
                    air_day: anime.broadcast.day,
                    synopsis: anime.synopsis,
                    imageURL: anime.images.jpg.image_url
                });
            });
        }
    }
    catch (err) {
        error = 'Server Failure';
        status = 500;
    }

    // Returns search results
    var ret = {data:animeData, error:error};
    res.status(status).json(ret);
});

// Starts the Express server and listens on port 5000 for incoming request
app.listen(5000);
