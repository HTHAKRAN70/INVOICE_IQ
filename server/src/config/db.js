const { default: mongoose } = require("mongoose");
const { DATABASE_URL } = require("./index");

exports.dbconnect = async () => {
    try {
        await mongoose.connect(DATABASE_URL);
        console.log('Connected to the database');
    } catch (error) {
        console.log(error, "Error connecting to the database");
    }
};