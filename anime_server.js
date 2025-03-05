const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const {MongoClient} = require('mongodb');
const url = 'mongodb+srv://root:WhatAPassword@test.2svvr.mongodb.net/?retryWrites=true&w=majority&appName=Test'
const client = new MongoClient(url);
client.connect();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE, OPTIONS');
    next();
}
);

app.post('/api/login', async (req, res, next) => {
    // incoming: login, password
    // outgoing: id, name, emailAddress, error

    var error = '';

    const { login, password } = req.body;

    const db = client.db('COP4331');
    const results = await db.collection('Users').find({login:login, password:password}).toArray();

    var id = -1;
    var name = '';
    var email = '';

    if( results.length > 0 )
    {
        id = results[0]._id;
        name = results[0].name;
        email = results[0].emailAddress;
    }

    var ret = { id: id, name: name, emailAdress: email, error: error};
    res.status(200).json(ret);
});

app.post('/api/register', async (req, res, next) => {
    // incoming: login, password, name, emailAddress
    // outgoing: error

    var error = '';

    const db = client.db('COP4331');
    const results = await db.collection('Users').insertOne(req.body);

    var ret = { error: error };
    res.status(200).json(ret);
});

app.listen(5000);
