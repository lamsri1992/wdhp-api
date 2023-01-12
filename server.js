const express = require('express')
const cors = require('cors')

const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();
// Database Connection
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

const app = express()
app.use(cors())
app.use(express.json())

app.listen(3000, function () {
    console.log('CORS-enabled web server listening on port 3000')
})

app.get('/hn/:hn', async (req, res) => {
    const hn = req.params.hn

    try {
        connection.query('SELECT hn,pname,fname,lname,birthday,cid,religion,educate,family_status,occupation,addrpart,road,moopart,tmbpart,amppart,chwpart,sex FROM patient WHERE hn = ?',
        [hn],(err, result, field) => {
            if (err) {
                console.log(err);
                return res.status(400).send();
            }
            res.status(200).json(result)
        })
    } catch(err) {
        console.log(err);
        return res.status(500).send();
    }
})

app.get('/methadone/:hn', async (req, res) => {
    const hn = req.params.hn

    try {
        connection.query('SELECT vn,hn,vstdate,diag_text FROM ovst WHERE hn = ? AND diag_text LIKE "%(F11.2)%" ORDER BY vstdate DESC',
        [hn],(err, result, field) => {
            if (err) {
                console.log(err);
                return res.status(400).send();
            }
            res.status(200).json(result)
        })
    } catch(err) {
        console.log(err);
        return res.status(500).send();
    }
})