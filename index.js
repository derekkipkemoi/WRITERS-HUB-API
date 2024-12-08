const express = require('express');
const mongoose = require('mongoose');
var bodyParser = require('body-parser')
const path = require('path');
var cors = require('cors')
const app = express();
const dotenv = require('dotenv');

// Load environment variables from a .env file
dotenv.config();

const PORT = process.env.SERVER_PORT 
const HOST = process.env.SERVER_HOST



app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const url = "mongodb://localhost:27017/cv_garage_db"; // Replace with your MongoDB connection URL
mongoose.connect(url);
const con = mongoose.connection;
try {
    con.on('open', () => {
        console.log('Connected to the database');

        app.use(bodyParser.json());
        app.use(cors())

        //Routes
        const users = require('./routes/users')
        app.use('/users', users)

        app.get('/', (req, res) => {
            res.send('Hello World!');
        });

        app.listen(PORT, HOST, () => {
            console.log(`Server is running on http://${HOST}:${PORT}`);
        });
    })
} catch (error) {
    console.log("Error: " + error);
}

