const express = require('express');
const path = require('path');
const app = express()
const bodyParser = require('body-parser');

const {open} = require('sqlite');
const sqlite3 = require('sqlite3');
const cors = require('cors');
const dbPath = path.join(__dirname,'hodinfo.db');
const PORT = 3000;
app.use(cors())
app.use(bodyParser.json());

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


app.post('/storedata', async (req, res) => {
    const data = req.body;
    console.log(data)
    const existingData = `SELECT * FROM data`
    const response = await db.all(existingData)
    if(response.length === 10){
        return res.status(400).json({message: 'data already exit'});
    }
    
    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ message: 'No data provided' });
    }
  
    const insertPromises = data.map(eachData => {
      const storeQuery = `
        INSERT INTO data (base_unit, last, volume, sell, buy, name)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      return new Promise((resolve, reject) => {
        db.run(storeQuery, [
          eachData.base_unit,
          eachData.last,
          eachData.volume,
          eachData.sell,
          eachData.buy,
          eachData.name
        ], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID });
          }
        });
      });
    });
  
    try {
      const responses = await Promise.all(insertPromises);
      res.status(201).json({ message: 'Data stored successfully', responses });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/", async(req,res) => {
    const getDataQuery = `
    SELECT * FROM data`;
    const response = await db.all(getDataQuery)
    res.send(response);
}) 