const express = require('express')
require('dotenv').config();
const { connectDB, disconnectDb } = require('./config/db_connection')
const errorController = require('./controllers/errorController')

const MONGO_CONN_URL = process.env.MONGO_CONN_KEY || 'mongodb://127.0.0.1:27017/communityfy';
const PORT = process.env.PORT || 8080;

const v1_routes = require('./routes/v1')
// const v2_routes = require('./routes/v2')

connectDB(MONGO_CONN_URL);
const app = express();

app.use(express.json())

app.use('/api/v1', v1_routes)
// app.use('/api/v2', v2_routes)
app.use(errorController);

app.get('', (req, res) => {
    res.send('💁 Welcome to CommunityFy App 🧑‍🤝‍🧑🧑‍🤝')
})




app.listen(PORT, () => {
    console.log('Server is up on PORT:', PORT);
})