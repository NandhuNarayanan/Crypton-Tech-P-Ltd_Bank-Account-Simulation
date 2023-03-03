const mongoose = require('mongoose')
const url = "mongodb://localhost:27017/backaccounts"

const dataBase = async ()=>{
    try {
        mongoose.connect(url,{
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log('Db connected');
    } catch (error) {
        console.log(error);
    }
}

module.exports = dataBase;