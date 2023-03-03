const express = require('express');
const bodyParser = require('body-parser');
const dataBase = require('./config/dataBase');
const mongoose = require('mongoose');
const morgan = require('morgan');
const PORT = 9000
const accountRoute = require('./routes/accountRoute')
dataBase()


const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));

app.use('/',accountRoute)

app.listen(PORT,()=>{
    console.log(`port running at${PORT}`);
})