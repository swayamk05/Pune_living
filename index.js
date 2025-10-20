require('dotenv').config();

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("./models/listing.js");

// Get the database URL from your .env file
const dbUrl = process.env.ATLASDB_URL;

async function main() {
    // Use the dbUrl variable to connect to the database
    await mongoose.connect(dbUrl);
}

const initDb = async () => {
    // Clear all existing listings from the database
    await Listing.deleteMany({});

    // IMPORTANT: Make sure this owner ID '68dd2cdb1da07aeea7fc7f18' 
    // is a valid user ID that exists in your 'users' collection.
    initData.data = initData.data.map((obj) => ({ ...obj, owner: '68dd2cdb1da07aeea7fc7f18' }));

    // Insert the new, updated data into the database
    await Listing.insertMany(initData.data);
    console.log("Data was initialized successfully.");
};

// Main execution block to connect and then initialize
main()
    .then(() => {
        console.log("Database connected successfully.");
        // Call the initDb function only AFTER the connection is established
        return initDb();
    })
    .then(() => {
        // Close the database connection after the script finishes
        console.log("Data initialization complete. Closing connection.");
        mongoose.connection.close();
    })
    .catch((err) => {
        console.log("An error occurred during the process:", err);
    });

