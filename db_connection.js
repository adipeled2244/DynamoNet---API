const mongoose = require('mongoose');
const consts = require('./constants');
const { DB_HOST, DB_USER, DB_PASS } = consts;
const url = DB_HOST;
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    user: DB_USER,
    pass: DB_PASS
};

module.exports = mongoose
    .connect(url, options)
    .then(() => console.log('connected'))
    .catch(err => console.log(`connection error: ${err}`));