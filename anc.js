const express = require('express')
const cors = require('cors')
const mysql = require('mysql2')
const dotenv = require('dotenv')

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
app.listen(8551, function () {
    // console.log('CORS-enabled web server listening on port 8551')
})

// ANC LIST
app.get('/anc/list', function (req, res) {
    try {
        connection.query('SELECT person_anc.person_anc_id,person.cid,patient.hn,CONCAT(person.pname,person.fname," ",person.lname) as patient,person_anc.anc_register_date as reg_date, ' +
            'person_anc.preg_no,person_anc.has_risk,person_anc.risk_list,person_anc.current_preg_age as preg_age, ' +
            'labor_status.labor_status_name as labor_status,person_anc.labor_date,person_anc.service_count,person_anc.anc_register_staff as reg_staff ' +
            'FROM person_anc ' +
            'LEFT JOIN person ON person.person_id = person_anc.person_id ' +
            'LEFT JOIN patient ON patient.cid = person.cid ' +
            'LEFT JOIN labor_status ON labor_status.labor_status_id = person_anc.labor_status_id ' +
            'ORDER BY person_anc.anc_register_date DESC',
            (err, result, field) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                res.status(200).send({
                    data: result
                });
            })
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
})