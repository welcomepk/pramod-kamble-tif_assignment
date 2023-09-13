const express = require('express')
require('dotenv').config();
const { connectDB, disconnectDb } = require('./config/db_connection')

const MONGO_CONN_URL = process.env.MONGO_CONN_KEY || 'mongodb://127.0.0.1:27017/communityfy';
const PORT = process.env.PORT || 8080;

connectDB(MONGO_CONN_URL);
const app = express();

app.use(express.json())

// routes
app.get('', (req, res) => {
    res.send('💁 Welcome to my CommunityFy App 🧑‍🤝‍🧑🧑‍🤝')
})

app.listen(PORT, () => {
    console.log('Server is up on PORT:', PORT);
})