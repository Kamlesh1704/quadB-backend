const express = require('express');
const path = require('path');
const app = express()

const {open} = require('sqlite');
const sqlite3 = require('sqlite3');
const cors = require('cors');
const dbPath = path.join(__dirname,'hodinfo.db');
const PORT = 3000;
app.use(cors())

let db = null
let initializeDBandServer = async () => {
    try{db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    })
    app.listen(PORT, () => {
        console.log(`App is running at ${PORT}`)
    })
    }catch (e) {
        console.log(`DB ERROR: ${e.message}`);
        process.exit(1);
    }
}

initializeDBandServer();

app.get("/", async(req,res) => {
    const getDataQuery = `
    SELECT * FROM data`;
    const response = await db.all(getDataQuery)
    res.send(response);
}) 