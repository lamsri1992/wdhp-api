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

app.listen(8550, function () {
    console.log('CORS-enabled web server listening on port 8550')
})

app.get('/hn/:hn', async (req, res) => {
    const hn = req.params.hn

    try {
        connection.query('SELECT hn,pname,fname,lname,birthday,cid,religion,educate,family_status,occupation,addrpart,road,moopart,tmbpart,amppart,chwpart,sex FROM patient WHERE hn = ?',
            [hn], (err, result, field) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                res.status(200).json(result)
            })
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
})

// Methadone API
app.get('/methadone/:hn', async (req, res) => {
    const hn = req.params.hn

    try {
        connection.query('SELECT ovst.vn,ovst.hn,ovst.vstdate,ovstdiag.icd10 ' +
            'FROM ovst ' +
            'LEFT JOIN patient ON patient.hn = ovst.hn ' +
            'LEFT JOIN ovstdiag ON ovstdiag.vn = ovst.vn ' +
            'WHERE icd10 IN("F112","F1120","F1125") ' +
            'AND ovst.hn = ? ' +
            'ORDER BY ovstdiag.vstdate DESC',
            [hn], (err, result, field) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                res.status(200).json(result)
            })
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
})

app.get('/vst/:vn', async (req, res) => {
    const vn = req.params.vn

    try {
        connection.query('SELECT opdscreen.vn,opdscreen.bpd,opdscreen.bps,opdscreen.bw,opdscreen.cc,opdscreen.pulse,' +
            'opdscreen.temperature,opdscreen.note,opdscreen.rr,opdscreen.height,opdscreen.bmi,opdscreen.found_amphetamine ' +
            'FROM opdscreen ' +
            'WHERE opdscreen.vn = ? ',
            [vn], (err, result, field) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                res.status(200).json(result)
            })
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
})

app.get('/lab/:vn', async (req, res) => {
    const vn = req.params.vn

    try {
        connection.query('SELECT lab_head.lab_order_number,lab_order.lab_items_name_ref,lab_order.lab_order_result ' +
            'FROM lab_head ' +
            'LEFT JOIN lab_order ON lab_order.lab_order_number = lab_head.lab_order_number ' +
            'WHERE lab_head.vn = ? ',
            [vn], (err, result, field) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                res.status(200).json(result)
            })
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
})

app.get('/drug/:vn', async (req, res) => {
    const vn = req.params.vn

    try {
        connection.query('SELECT opitemrece.vn,drugitems.icode,drugitems.`name`,opitemrece.qty ' +
            'FROM opitemrece ' +
            'LEFT JOIN drugitems ON drugitems.icode = opitemrece.icode ' +
            'WHERE opitemrece.vn = ? AND drugitems.icode IS NOT NULL',
            [vn], (err, result, field) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                res.status(200).json(result)
            })
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
})

// Matrix API
app.get('/matrix/:hn', async (req, res) => {
    const hn = req.params.hn

    try {
        connection.query('SELECT ovst.vn,ovst.hn,ovst.vstdate,ovstdiag.icd10 ' +
            'FROM ovst ' +
            'LEFT JOIN patient ON patient.hn = ovst.hn ' +
            'LEFT JOIN ovstdiag ON ovstdiag.vn = ovst.vn ' +
            'WHERE icd10 IN("F195","Z503") ' +
            'AND ovst.hn = ? ' +
            'ORDER BY ovstdiag.vstdate DESC',
            [hn], (err, result, field) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                res.status(200).json(result)
            })
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
})

// ANC
app.get('/anc/:dstart/:dended', function (req, res) {
    const dstart = req.params.dstart;
    const dended = req.params.dended;
    try {
        connection.query('SELECT ovst.vn,ovst.hn,concat(fname," ",lname) as pname,ovstdiag.icd10,lab_order.lab_items_name_ref,lab_order.lab_order_result,ovst.vstdate ' +
            'FROM ovst ' +
            'LEFT JOIN patient ON patient.hn = ovst.hn ' +
            'LEFT JOIN ovstdiag ON ovstdiag.vn = ovst.vn ' +
            'LEFT JOIN lab_head ON lab_head.vn = ovst.vn ' +
            'LEFT JOIN lab_order ON lab_order.lab_order_number = lab_head.lab_order_number ' +
            'WHERE icd10 IN("Z33","Z340","Z348") ' +
            'AND lab_items_name_ref IN("Hb","HCT(30104)","HCT") ' +
            'AND ovst.vstdate BETWEEN ? AND ? ' +
            'ORDER BY ovstdiag.vstdate DESC',
            [dstart, dended], (err, result, field) => {
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